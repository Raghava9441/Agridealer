import type { Request, Response } from 'express'
import { loginSchema, mfaVerifySchema } from '@agridealer/contracts'
import { authService, type TokenPair } from './auth.service'
import { env } from '../../config/env'
import { AppError } from '../../shared/errors/AppError'
import { sendSuccess } from '../../shared/http/respond'

const REFRESH_COOKIE = 'refreshToken'

function setRefreshCookie(res: Response, tokens: TokenPair): void {
  res.cookie(REFRESH_COOKIE, tokens.refreshCookie, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: tokens.refreshTtlMs,
    path: '/api/v1/auth',
  })
}

/** Login/refresh/MFA only make sense from a resolved tenant subdomain. */
function requireSubdomainTenantId(req: Request): string {
  if (!req.subdomainTenant) {
    throw new AppError('TENANT_NOT_FOUND', undefined, 'Please sign in from your organization\'s URL')
  }
  return req.subdomainTenant.id
}

export const authController = {
  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body)
    const tenantId = requireSubdomainTenantId(req)
    const result = await authService.login(input, tenantId)

    if ('challengeToken' in result) {
      throw new AppError('MFA_REQUIRED', { challengeToken: result.challengeToken }, 'MFA verification required')
    }

    setRefreshCookie(res, result.tokens)
    sendSuccess(req, res, { accessToken: result.tokens.accessToken })
  },

  async verifyMfa(req: Request, res: Response) {
    const input = mfaVerifySchema.parse(req.body)
    const tenantId = requireSubdomainTenantId(req)
    const { tokens } = await authService.verifyMfa(input, tenantId)

    setRefreshCookie(res, tokens)
    sendSuccess(req, res, { accessToken: tokens.accessToken })
  },

  async refresh(req: Request, res: Response) {
    const cookieValue = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!cookieValue) {
      throw new AppError('UNAUTHENTICATED', undefined, 'No refresh token presented')
    }

    const tenantId = requireSubdomainTenantId(req)
    const { tokens } = await authService.refresh(cookieValue, tenantId)
    setRefreshCookie(res, tokens)
    sendSuccess(req, res, { accessToken: tokens.accessToken })
  },

  async logout(req: Request, res: Response) {
    const cookieValue = req.cookies?.[REFRESH_COOKIE] as string | undefined
    await authService.logout(cookieValue)
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
    sendSuccess(req, res, null)
  },

  async me(req: Request, res: Response) {
    sendSuccess(req, res, {
      userId: req.user.userId,
      tenantId: req.user.tenantId,
      role: req.user.role,
      tenant: { plan: req.tenant.plan, features: req.tenant.features, slug: req.tenant.slug, name: req.tenant.name },
    })
  },
}
