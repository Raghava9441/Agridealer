import request from 'supertest'
import { createApp } from '../../app'

describe('error envelope', () => {
  it('returns a normalized field-array for validation errors', async () => {
    const app = createApp()
    const res = await request(app).post('/api/v1/auth/login').send({})

    expect(res.status).toBe(422)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('VALIDATION_FAILED')
    expect(res.body.error.retryable).toBe(false)
    expect(Array.isArray(res.body.error.details.fields)).toBe(true)
    expect(res.body.error.details.fields[0]).toEqual(
      expect.objectContaining({ path: expect.any(String), message: expect.any(String), code: expect.any(String) }),
    )
    expect(res.body.meta.timestamp).toEqual(expect.any(String))
  })

  it('includes retryable + timestamp on a thrown AppError, and echoes X-Request-Id', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('X-Request-Id', 'test-request-id-123')
      .send({ email: 'owner@demo.test', password: 'irrelevant' })

    // No subdomain resolves from supertest's default host, so login rejects
    // with TENANT_NOT_FOUND before ever touching the database.
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('TENANT_NOT_FOUND')
    expect(res.body.error.retryable).toBe(false)
    expect(res.body.meta.timestamp).toEqual(expect.any(String))
    expect(res.body.meta.requestId).toBe('test-request-id-123')
    expect(res.headers['x-request-id']).toBe('test-request-id-123')
  })

  it('marks an unknown route as non-retryable NOT_FOUND with a timestamp', async () => {
    // Outside /api/v1 entirely — a path under that prefix hits `authenticate`
    // before route matching and correctly surfaces as 401, not 404.
    const app = createApp()
    const res = await request(app).get('/nonexistent-route')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(res.body.error.retryable).toBe(false)
    expect(res.body.meta.timestamp).toEqual(expect.any(String))
  })
})
