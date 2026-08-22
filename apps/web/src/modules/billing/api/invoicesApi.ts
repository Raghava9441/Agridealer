import type { CreateInvoiceInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export type { CreateInvoiceInput, CreateInvoiceLineInput } from '@agridealer/contracts'

export interface InvoiceLine {
  productId: string
  batchId?: string
  productName: string
  quantity: number
  unitPricePaise: number
  discountPaise: number
  taxRatePercent: number
  taxAmountPaise: number
  lineTotalPaise: number
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  customerId?: string
  customerName?: string
  lines: InvoiceLine[]
  subtotalPaise: number
  discountTotalPaise: number
  taxTotalPaise: number
  grandTotalPaise: number
  amountPaidPaise: number
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid'
  status: 'draft' | 'held' | 'finalized' | 'cancelled'
  createdAt: string
}

export interface InvoiceListFilter {
  customerId?: string
  status?: 'draft' | 'held' | 'finalized' | 'cancelled'
}

export const invoicesKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoicesKeys.all, 'list'] as const,
  list: (filter: InvoiceListFilter) => [...invoicesKeys.lists(), filter] as const,
  details: () => [...invoicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoicesKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/billing/invoices.routes.ts. */
export const invoicesApi = {
  list(filter: InvoiceListFilter = {}): Promise<Invoice[]> {
    return apiRequest<Invoice[]>(`/invoices${buildQueryString(filter)}`)
  },
  get(id: string): Promise<Invoice> {
    return apiRequest<Invoice>(`/invoices/${id}`)
  },
  create(input: CreateInvoiceInput, idempotencyKey: string): Promise<Invoice> {
    return apiRequest<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(input), idempotencyKey })
  },
}
