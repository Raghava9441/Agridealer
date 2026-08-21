import jwt from 'jsonwebtoken'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { accessTokenClaimsSchema, type AccessTokenClaims } from '@agridealer/contracts'
import { AppError } from '../shared/errors/AppError'
import { env } from '../config/env'

declare module 'express-serve-static-core' {
  interface Request {
    user: AccessTokenClaims
  }
}

/**
 * Verifies the bearer access token and attaches its claims to req.user
 * (docs §3.3, §11.1). tenantId is read exclusively from this verified
 * claim downstream — never from a body, query string, or header.
 *
 * KNOWN GAP: this only checks the JWT signature/expiry, not whether
 * claims.tokenVersion still matches the user's current tokenVersion in the
 * database. Docs §11.1 requires a password/role/status change to invalidate
 * every already-issued access token immediately — that needs a cheap
 * revocation check (e.g. a short-TTL Redis cache of tokenVersion per user,
 * invalidated wherever tokenVersion is incremented) before this is complete.
 */
export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHENTICATED', undefined, 'Missing bearer token'))
  }

  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    req.user = accessTokenClaimsSchema.parse(payload)
    next()
  } catch {
    next(new AppError('UNAUTHENTICATED', undefined, 'Invalid or expired access token'))
  }
}
