import type { CreatePaymentInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'

export interface PaymentAllocation {
  documentType: 'Invoice' | 'VendorBill'
  documentId: string
  amountPaise: number
}

export interface Payment {
  _id: string
  direction: 'in' | 'out'
  partyType: 'customer' | 'vendor'
  partyId: string
  amountPaise: number
  method: PaymentMethod
  referenceNumber?: string
  appliedTo: PaymentAllocation[]
  recordedBy: string
  recordedAt: string
}

export interface PaymentListFilter {
  customerId?: string
}

export const paymentsKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (filter: PaymentListFilter) => [...paymentsKeys.lists(), filter] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
}

/**
 * Talks to apps/api/src/modules/credit/payments.routes.ts. Only customer
 * receipts are wired up here (createPaymentSchema takes customerId, and the
 * controller calls PaymentsService.recordCustomerPayment specifically) —
 * vendor payments (direction: 'out') have no route yet on the backend.
 */
export const paymentsApi = {
  list(filter: PaymentListFilter = {}): Promise<Payment[]> {
    return apiRequest<Payment[]>(`/payments${buildQueryString(filter)}`)
  },
  get(id: string): Promise<Payment> {
    return apiRequest<Payment>(`/payments/${id}`)
  },
  create(input: CreatePaymentInput, idempotencyKey: string): Promise<Payment> {
    return apiRequest<Payment>('/payments', { method: 'POST', body: JSON.stringify(input), idempotencyKey })
  },
}
