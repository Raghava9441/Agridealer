import type { Request, RequestHandler, Response } from 'express'
import { redis } from '../config/redis'
import { env } from '../config/env'
import { AppError } from '../shared/errors/AppError'
import { asyncHandler } from '../shared/utils/asyncHandler'

const HEADER = 'idempotency-key'
const PENDING = '__PENDING__'
/** Short — just long enough for a normal request to finish; bounds how long a crashed request can block a retry. */
const PENDING_LOCK_TTL_SECONDS = 120

interface CachedResponse {
  status: number
  body: unknown
}

function cacheKey(req: Request, idempotencyKey: string): string {
  const route = `${req.method}:${req.baseUrl}${req.path}`
  return `idem:${req.tenant.id}:${req.user.userId}:${route}:${idempotencyKey}`
}

/**
 * Enforces the client-supplied Idempotency-Key header (docs §8.6) on a
 * mutating route, mirroring auditAction's opt-in-per-route shape. A
 * duplicate request with the same key either replays the first attempt's
 * response verbatim (controller never runs again) or, if the first attempt
 * is still in flight, gets a 409 instead of racing it. A failed first
 * attempt releases the key so a retry-after-fixing-the-problem isn't stuck
 * replaying a stale error.
 */
export function idempotent(): RequestHandler {
  return asyncHandler(async (req: Request, res: Response, next) => {
    const idempotencyKey = req.headers[HEADER] as string | undefined
    if (!idempotencyKey) return next()

    const key = cacheKey(req, idempotencyKey)
    const claimed = await redis.set(key, PENDING, 'EX', PENDING_LOCK_TTL_SECONDS, 'NX')

    if (!claimed) {
      const stored = await redis.get(key)
      if (stored && stored !== PENDING) {
        const cached = JSON.parse(stored) as CachedResponse
        res.status(cached.status).json(cached.body)
        return
      }
      throw new AppError('DUPLICATE_REQUEST', undefined, 'A request with this idempotency key is already in progress')
    }

    const originalJson = res.json.bind(res)
    res.json = ((body: unknown) => {
      const status = res.statusCode
      if (status >= 200 && status < 300) {
        void redis.set(key, JSON.stringify({ status, body }), 'EX', env.IDEMPOTENCY_KEY_TTL_SECONDS)
      } else {
        void redis.del(key)
      }
      return originalJson(body)
    }) as typeof res.json

    next()
  })
}
