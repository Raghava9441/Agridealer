import { http, HttpResponse } from 'msw'
import { appConfig } from '@/bootstrap/config'

const base = appConfig.apiBaseUrl

/** MSW handlers mirroring the real response envelope ({success, data, error} — see apps/api's errorHandler.ts) for the endpoints the built modules call. Extend this file as more modules get built. */
export const handlers = [
  http.get(`${base}/customers`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: 'cust-1',
          name: 'Ravi Kumar',
          phone: '9999900001',
          creditLimitPaise: 0,
          creditDays: 0,
          currentBalancePaise: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      meta: { requestId: 'test-request-id' },
    })
  }),

  http.post(`${base}/customers`, async ({ request }) => {
    const body = (await request.json()) as { name: string; phone: string }
    return HttpResponse.json(
      {
        success: true,
        data: {
          _id: 'cust-new',
          name: body.name,
          phone: body.phone,
          creditLimitPaise: 0,
          creditDays: 0,
          currentBalancePaise: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        meta: { requestId: 'test-request-id' },
      },
      { status: 201 },
    )
  }),

  http.get(`${base}/products`, () => {
    return HttpResponse.json({ success: true, data: [], meta: { requestId: 'test-request-id' } })
  }),

  http.get(`${base}/invoices`, () => {
    return HttpResponse.json({ success: true, data: [], meta: { requestId: 'test-request-id' } })
  }),
]
