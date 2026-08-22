import type { CreatePurchaseOrderInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled'

export interface PurchaseOrderLine {
  productId: string
  quantity: number
  unitCostPaise: number
  /** Running total received so far across all linked goods receipts. */
  receivedQuantity: number
}

export interface PurchaseOrder {
  _id: string
  poNumber: string
  vendorId: string
  lines: PurchaseOrderLine[]
  status: PurchaseOrderStatus
  expectedDate?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderListFilter {
  status?: PurchaseOrderStatus
  vendorId?: string
}

export const purchaseOrdersKeys = {
  all: ['purchaseOrders'] as const,
  lists: () => [...purchaseOrdersKeys.all, 'list'] as const,
  list: (filter: PurchaseOrderListFilter) => [...purchaseOrdersKeys.lists(), filter] as const,
  details: () => [...purchaseOrdersKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseOrdersKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/purchases/purchaseOrders.routes.ts. */
export const purchaseOrdersApi = {
  list(filter: PurchaseOrderListFilter = {}): Promise<PurchaseOrder[]> {
    return apiRequest<PurchaseOrder[]>(`/purchase-orders${buildQueryString(filter)}`)
  },
  get(id: string): Promise<PurchaseOrder> {
    return apiRequest<PurchaseOrder>(`/purchase-orders/${id}`)
  },
  create(input: CreatePurchaseOrderInput, idempotencyKey: string): Promise<PurchaseOrder> {
    return apiRequest<PurchaseOrder>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(input),
      idempotencyKey,
    })
  },
  cancel(id: string, idempotencyKey: string): Promise<PurchaseOrder> {
    return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/cancel`, { method: 'POST', idempotencyKey })
  },
}
