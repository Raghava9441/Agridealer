import expressRateLimit from 'express-rate-limit'
import type { Request } from 'express'

/**
 * Uses express-rate-limit's built-in in-memory store rather than the
 * Redis-backed store described in docs §8.7/§12.2. That's fine for a
 * single dev instance; it stops being fine the moment there's more than
 * one API replica (docs §3.1), since counters wouldn't be shared across
 * them — swap back to a RedisStore (see git history) before running
 * more than one instance.
 */

/** General API limit (docs §8.7): 300/min per authenticated user. */
export const rateLimit = expressRateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.userId ?? req.ip ?? 'anonymous',
})

/** Login endpoint limit (docs §8.7): 10/15min by IP, defends against credential stuffing. */
export const authRateLimit = expressRateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? 'anonymous',
})
