import { logger } from './logger'
import { InMemoryStore } from './inMemoryStore'

/**
 * Redis is not set up for local dev yet (no instance running/configured).
 * Everything that would use it — refresh-token storage in auth.service.ts,
 * the tenant cache in tenants.cache.ts, the /health/ready check — runs
 * against this in-memory stand-in instead. It implements the same handful
 * of commands (get/set-with-EX/del/ping) so none of those call sites need
 * to change. No persistence, not shared across processes/replicas.
 *
 * To switch to real Redis later:
 *   1. `import Redis from 'ioredis'`
 *   2. replace the export below with:
 *        export const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true })
 *        redis.on('error', (err) => logger.error({ err }, 'Redis connection error'))
 *   3. in connectRedis(), replace the log line with `await redis.connect()`
 * (maxRetriesPerRequest: null is required for BullMQ, but it also means
 * commands hang forever instead of failing fast if connect() is never
 * called — make sure connectRedis() actually runs before relying on it.)
 */
export const redis = new InMemoryStore()

export async function connectRedis(): Promise<void> {
  logger.info('Using in-memory cache/session store — Redis not configured (see config/redis.ts)')
}

export async function disconnectRedis(): Promise<void> {
  redis.disconnect()
}
