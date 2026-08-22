import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface StockSummary {
  productId: string
  productName: string
  unit: string
  reorderLevel: number
  totalQuantityAvailable: number
  batchCount: number
  nearestExpiryDate: string | null
  isLowStock: boolean
}

export type ProductBatchStatus = 'active' | 'expired' | 'exhausted'

export interface ProductBatch {
  _id: string
  productId: string
  batchNumber: string
  mfgDate?: string
  expiryDate?: string
  purchasePricePaise: number
  mrpPaise: number
  quantityReceived: number
  quantityAvailable: number
  vendorId?: string
  status: ProductBatchStatus
  createdAt: string
  updatedAt: string
}

export type StockMovementDirection = 'in' | 'out'
export type StockMovementReason = 'purchase_receipt' | 'sale' | 'sale_return' | 'purchase_return' | 'adjustment' | 'transfer'

export interface StockMovement {
  _id: string
  productId: string
  batchId?: string
  direction: StockMovementDirection
  quantity: number
  reason: StockMovementReason
  unitCostPaise: number
  referenceType?: 'PurchaseOrder' | 'GoodsReceipt' | 'Invoice'
  referenceId?: string
  performedBy: string
  notes?: string
  performedAt: string
}

export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: (productId: string) => [...inventoryKeys.all, 'stock', productId] as const,
  batches: (productId: string) => [...inventoryKeys.all, 'batches', productId] as const,
  movements: (productId: string) => [...inventoryKeys.all, 'movements', productId] as const,
  expiring: (days: number) => [...inventoryKeys.all, 'expiring', days] as const,
}

/** Talks to apps/api/src/modules/inventory/inventory.routes.ts — read-only, no mutation lives in this module. */
export const inventoryApi = {
  getStockSummary(productId: string): Promise<StockSummary> {
    return apiRequest<StockSummary>(`/inventory/stock/${productId}`)
  },
  getBatches(productId: string): Promise<ProductBatch[]> {
    return apiRequest<ProductBatch[]>(`/inventory/batches/${productId}`)
  },
  getMovements(productId: string): Promise<StockMovement[]> {
    return apiRequest<StockMovement[]>(`/inventory/movements/${productId}`)
  },
  /** Batches expiring within `days` (backend default: 30) across every product, not scoped to one. */
  getExpiring(days?: number): Promise<ProductBatch[]> {
    return apiRequest<ProductBatch[]>(`/inventory/expiring${buildQueryString({ days })}`)
  },
}
