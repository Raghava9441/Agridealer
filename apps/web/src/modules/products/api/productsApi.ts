import type { CreateProductInput, UpdateProductInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface Product {
  _id: string
  sku: string
  name: string
  category: string
  unit: string
  hsnCode: string
  gstRatePercent: number
  brand?: string
  description?: string
  batchTracked: boolean
  reorderLevel: number
  status: 'active' | 'discontinued'
  createdAt: string
  updatedAt: string
}

export interface ProductListFilter {
  search?: string
  category?: string
  status?: 'active' | 'discontinued'
}

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filter: ProductListFilter) => [...productsKeys.lists(), filter] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/products/products.routes.ts. */
export const productsApi = {
  list(filter: ProductListFilter = {}): Promise<Product[]> {
    return apiRequest<Product[]>(`/products${buildQueryString(filter)}`)
  },
  get(id: string): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`)
  },
  create(input: CreateProductInput): Promise<Product> {
    return apiRequest<Product>('/products', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id: string, input: UpdateProductInput): Promise<Product> {
    return apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
}
