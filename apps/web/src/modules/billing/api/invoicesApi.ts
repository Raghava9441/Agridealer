import { apiRequest } from '@/core/http/apiClient'

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

export interface CreateInvoiceLineInput {
  productId: string
  quantity: number
  unitPricePaise: number
  discountPaise: number
}

export interface CreateInvoiceInput {
  customerId?: string
  lines: CreateInvoiceLineInput[]
}

export const invoicesKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoicesKeys.all, 'list'] as const,
  list: (customerId?: string) => [...invoicesKeys.lists(), { customerId }] as const,
}

/** Talks to apps/api/src/modules/billing/invoices.routes.ts. */
export const invoicesApi = {
  list(customerId?: string): Promise<Invoice[]> {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : ''
    return apiRequest<Invoice[]>(`/invoices${qs}`)
  },
  create(input: CreateInvoiceInput, idempotencyKey: string): Promise<Invoice> {
    return apiRequest<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(input), idempotencyKey })
  },
}
