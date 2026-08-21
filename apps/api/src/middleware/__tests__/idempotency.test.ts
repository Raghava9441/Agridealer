import express from 'express'
import request from 'supertest'
import { idempotent } from '../idempotency'
import { requestContext } from '../requestContext'
import { errorHandler } from '../errorHandler'
import { asyncHandler } from '../../shared/utils/asyncHandler'
import { redis } from '../../config/redis'

/**
 * Standalone app (same "no live database" shape as health.test.ts) — stands
 * in a fake tenant/user directly on `req` instead of running the real
 * authenticate/tenantResolver pipeline, since idempotent() only needs
 * req.tenant.id/req.user.userId to already be populated by the time it runs.
 */
function buildTestApp(status: number) {
  let calls = 0

  const app = express()
  app.use(express.json())
  app.use(requestContext)
  app.use((req, _res, next) => {
    req.tenant = { id: 'tenant-1', slug: 'demo', name: 'Demo', status: 'active', plan: 'starter', features: [] }
    req.user = { userId: 'user-1', tenantId: 'tenant-1', role: 'owner', tokenVersion: 0 }
    next()
  })
  app.post(
    '/thing',
    idempotent(),
    asyncHandler(async (_req, res) => {
      calls += 1
      res.status(status).json({ calls })
    }),
  )
  app.use(errorHandler)

  return { app, getCalls: () => calls }
}

describe('idempotent()', () => {
  it('replays the first response verbatim without re-invoking the controller', async () => {
    const { app, getCalls } = buildTestApp(201)

    const first = await request(app).post('/thing').set('Idempotency-Key', 'key-a').send({})
    const second = await request(app).post('/thing').set('Idempotency-Key', 'key-a').send({})

    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    expect(second.body).toEqual(first.body)
    expect(getCalls()).toBe(1)
  })

  it('runs the controller again for a different key', async () => {
    const { app, getCalls } = buildTestApp(201)

    await request(app).post('/thing').set('Idempotency-Key', 'key-b1').send({})
    await request(app).post('/thing').set('Idempotency-Key', 'key-b2').send({})

    expect(getCalls()).toBe(2)
  })

  it('runs the controller again with no Idempotency-Key header at all', async () => {
    const { app, getCalls } = buildTestApp(201)

    await request(app).post('/thing').send({})
    await request(app).post('/thing').send({})

    expect(getCalls()).toBe(2)
  })

  it('rejects a concurrent duplicate with 409 while the first is still in flight', async () => {
    const { app } = buildTestApp(201)
    await redis.set('idem:tenant-1:user-1:POST:/thing:key-c', '__PENDING__', 'EX', 120)

    const res = await request(app).post('/thing').set('Idempotency-Key', 'key-c').send({})

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DUPLICATE_REQUEST')
  })

  it('releases the key on a failed attempt so a retry with the same key runs the controller', async () => {
    const { app, getCalls } = buildTestApp(500)

    const first = await request(app).post('/thing').set('Idempotency-Key', 'key-d').send({})
    expect(first.status).toBe(500)

    const second = await request(app).post('/thing').set('Idempotency-Key', 'key-d').send({})
    expect(second.status).toBe(500)
    expect(getCalls()).toBe(2)
  })
})
