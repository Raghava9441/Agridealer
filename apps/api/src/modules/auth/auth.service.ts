import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { authenticator } from 'otplib'
import type { AccessTokenClaims, LoginInput, MfaVerifyInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import { env } from '../../config/env'
import { redis } from '../../config/redis'
import { generateOpaqueToken, randomUUID, sha256 } from '../../shared/utils/hash'
import { User, type IUser } from '../users/users.model'

const MFA_CHALLENGE_TTL_SECONDS = 5 * 60
const refreshKey = (userId: string, family: string) => `refresh:${userId}:${family}`

export interface TokenPair {
  accessToken: string
  refreshCookie: string
  refreshTtlMs: number
}

function ttlToSeconds(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl)
  if (!match) throw new Error(`Invalid TTL format: ${ttl}`)
  const [, amount, unit] = match
  const n = Number(amount)
  const multiplier = { s: 1, m: 60, h: 3600, d: 86_400 }[unit as 's' | 'm' | 'h' | 'd']
  return n * multiplier
}

function signAccessToken(user: IUser): string {
  const claims: AccessTokenClaims = {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    tokenVersion: user.tokenVersion,
  }
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: ttlToSeconds(env.ACCESS_TOKEN_TTL) })
}

/**
 * Refresh cookie encodes userId so the endpoint can look the user up without
 * a (possibly already-expired) access token. family identifies the rotation
 * chain; token is the opaque secret whose hash is stored server-side.
 */
async function issueTokenPair(user: IUser): Promise<TokenPair> {
  const accessToken = signAccessToken(user)

  const family = randomUUID()
  const token = generateOpaqueToken()
  const refreshTtlSeconds = ttlToSeconds(env.REFRESH_TOKEN_TTL)
  await redis.set(refreshKey(user.id, family), sha256(token), 'EX', refreshTtlSeconds)

  return {
    accessToken,
    refreshCookie: `${user.id}.${family}.${token}`,
    refreshTtlMs: refreshTtlSeconds * 1000,
  }
}

/**
 * Auth is the one boundary that runs before a full tenant context exists
 * (no JWT yet), so it bypasses the tenant-scoped UserRepository (docs §6.5)
 * in favour of direct model access. Which tenant is resolved by the
 * request's subdomain (subdomainResolver, req.subdomainTenant) — the
 * `tenantId` passed into every method here — not by the email alone: the
 * unique index on User is {tenantId, email}, not a global-unique email, so
 * scoping the lookup is required for correctness, not just UX.
 */
export class AuthService {
  async login(input: LoginInput, tenantId: string): Promise<{ tokens: TokenPair } | { challengeToken: string }> {
    const user = await User.findOne({ tenantId, email: input.email.toLowerCase(), status: 'active' })
    if (!user) {
      throw new AppError('UNAUTHENTICATED', undefined, 'Invalid email or password')
    }

    const passwordOk = await argon2.verify(user.passwordHash, input.password)
    if (!passwordOk) {
      throw new AppError('UNAUTHENTICATED', undefined, 'Invalid email or password')
    }

    if (user.mfaEnabled) {
      const challengeToken = jwt.sign(
        { userId: user.id, tenantId: user.tenantId, purpose: 'mfa' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: MFA_CHALLENGE_TTL_SECONDS },
      )
      return { challengeToken }
    }

    return { tokens: await issueTokenPair(user) }
  }

  async verifyMfa(input: MfaVerifyInput, tenantId: string): Promise<{ tokens: TokenPair }> {
    let payload: { userId: string; tenantId: string; purpose: string }
    try {
      payload = jwt.verify(input.challengeToken, env.JWT_ACCESS_SECRET) as typeof payload
    } catch {
      throw new AppError('UNAUTHENTICATED', undefined, 'MFA challenge expired')
    }
    if (payload.purpose !== 'mfa' || payload.tenantId !== tenantId) {
      throw new AppError('UNAUTHENTICATED')
    }

    const user = await User.findById(payload.userId).select('+mfaSecret')
    if (!user?.mfaSecret || user.tenantId !== tenantId || !authenticator.check(input.code, user.mfaSecret)) {
      throw new AppError('UNAUTHENTICATED', undefined, 'Invalid MFA code')
    }

    return { tokens: await issueTokenPair(user) }
  }

  /**
   * Rotates the refresh token on every use (docs §11.1). One Redis key per
   * (userId, family) holds the hash of the currently-valid token; presenting
   * anything else — expired, forged, or a reused pre-rotation token —
   * deletes the family and forces re-login, which is how theft-by-replay
   * is detected.
   */
  async refresh(cookieValue: string, tenantId: string): Promise<{ tokens: TokenPair }> {
    const [userId, family, token] = cookieValue.split('.')
    if (!userId || !family || !token) throw new AppError('UNAUTHENTICATED')

    const key = refreshKey(userId, family)
    const storedHash = await redis.get(key)
    if (!storedHash || storedHash !== sha256(token)) {
      await redis.del(key)
      throw new AppError('UNAUTHENTICATED', undefined, 'Refresh token invalid or reused')
    }

    const user = await User.findById(userId)
    if (!user || user.status !== 'active') {
      await redis.del(key)
      throw new AppError('UNAUTHENTICATED')
    }

    if (user.tenantId !== tenantId) {
      // A refresh cookie is host-scoped, not tenant-scoped by the browser —
      // this catches it being replayed against a different tenant's subdomain.
      await redis.del(key)
      throw new AppError('TENANT_MISMATCH')
    }

    await redis.del(key)
    return { tokens: await issueTokenPair(user) }
  }

  async logout(cookieValue: string | undefined): Promise<void> {
    if (!cookieValue) return
    const [userId, family] = cookieValue.split('.')
    if (userId && family) await redis.del(refreshKey(userId, family))
  }
}

export const authService = new AuthService()
