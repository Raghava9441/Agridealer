import type { CreateGoodsReceiptInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface GoodsReceiptLine {
  productId: string
  batchNumber: string
  mfgDate?: string
  expiryDate?: string
  quantity: number
  unitCostPaise: number
  mrpPaise: number
}

export interface GoodsReceipt {
  _id: string
  grnNumber: string
  purchaseOrderId?: string
  vendorId: string
  lines: GoodsReceiptLine[]
  receivedBy: string
  receivedAt: string
}

export interface GoodsReceiptListFilter {
  vendorId?: string
  purchaseOrderId?: string
}

export const goodsReceiptsKeys = {
  all: ['goodsReceipts'] as const,
  lists: () => [...goodsReceiptsKeys.all, 'list'] as const,
  list: (filter: GoodsReceiptListFilter) => [...goodsReceiptsKeys.lists(), filter] as const,
  details: () => [...goodsReceiptsKeys.all, 'detail'] as const,
  detail: (id: string) => [...goodsReceiptsKeys.details(), id] as const,
}

/**
 * Talks to apps/api/src/modules/purchases/goodsReceipts.routes.ts. Recording
 * a receipt here is what creates/tops-up stock — invalidate
 * inventoryKeys (stock/batches/movements) for the received products
 * alongside purchaseOrdersKeys (a receipt can move a PO to
 * partially_received/received) wherever this mutation is wired into UI.
 */
export const goodsReceiptsApi = {
  list(filter: GoodsReceiptListFilter = {}): Promise<GoodsReceipt[]> {
    return apiRequest<GoodsReceipt[]>(`/goods-receipts${buildQueryString(filter)}`)
  },
  get(id: string): Promise<GoodsReceipt> {
    return apiRequest<GoodsReceipt>(`/goods-receipts/${id}`)
  },
  create(input: CreateGoodsReceiptInput, idempotencyKey: string): Promise<GoodsReceipt> {
    return apiRequest<GoodsReceipt>('/goods-receipts', {
      method: 'POST',
      body: JSON.stringify(input),
      idempotencyKey,
    })
  },
}
