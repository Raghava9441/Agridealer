import request from 'supertest'
import { createApp } from '../../../app'

describe('GET /health', () => {
  it('returns ok without requiring auth or a live database', async () => {
    const app = createApp()
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
