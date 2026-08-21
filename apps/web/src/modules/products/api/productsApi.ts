import { apiRequest } from '@/core/http/apiClient'

export interface Product {
  _id: string
  sku: string
  name: string
  category: string
  unit: string
  hsnCode: string
  gstRatePercent: number
  status: 'active' | 'discontinued'
}

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (search: string) => [...productsKeys.lists(), { search }] as const,
}

/** Talks to apps/api/src/modules/products/products.routes.ts. */
export const productsApi = {
  list(search?: string): Promise<Product[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiRequest<Product[]>(`/products${qs}`)
  },
}
