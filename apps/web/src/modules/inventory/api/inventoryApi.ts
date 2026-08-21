import { apiRequest } from '@/core/http/apiClient'

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

export const inventoryKeys = {
  stock: (productId: string) => ['inventory', 'stock', productId] as const,
}

/** Talks to apps/api/src/modules/inventory/inventory.routes.ts. */
export const inventoryApi = {
  getStockSummary(productId: string): Promise<StockSummary> {
    return apiRequest<StockSummary>(`/inventory/stock/${productId}`)
  },
}
