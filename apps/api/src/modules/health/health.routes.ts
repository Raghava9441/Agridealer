import { Router } from 'express'
import mongoose from 'mongoose'
import { redis } from '../../config/redis'

/**
 * Unauthenticated liveness/readiness probe for the load balancer (docs
 * §3.2, §12.1). Deliberately outside the /api/v1 pipeline — no JWT, no
 * tenant, no rate limit.
 */
export const healthRoutes = Router()

healthRoutes.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

healthRoutes.get('/health/ready', async (_req, res) => {
  const mongoUp = mongoose.connection.readyState === 1
  let redisUp = false
  try {
    redisUp = (await redis.ping()) === 'PONG'
  } catch {
    redisUp = false
  }

  const ready = mongoUp && redisUp
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', mongo: mongoUp, redis: redisUp })
})
