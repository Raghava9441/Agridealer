import type { CreateVendorInput, UpdateVendorInput, AddressInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface Vendor {
  _id: string
  name: string
  phone: string
  email?: string
  gstin?: string
  address?: AddressInput
  currentBalancePaise: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface VendorListFilter {
  search?: string
  status?: 'active' | 'inactive'
}

export const vendorsKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorsKeys.all, 'list'] as const,
  list: (filter: VendorListFilter) => [...vendorsKeys.lists(), filter] as const,
  details: () => [...vendorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorsKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/purchases/vendors.routes.ts. */
export const vendorsApi = {
  list(filter: VendorListFilter = {}): Promise<Vendor[]> {
    return apiRequest<Vendor[]>(`/vendors${buildQueryString(filter)}`)
  },
  get(id: string): Promise<Vendor> {
    return apiRequest<Vendor>(`/vendors/${id}`)
  },
  create(input: CreateVendorInput): Promise<Vendor> {
    return apiRequest<Vendor>('/vendors', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id: string, input: UpdateVendorInput): Promise<Vendor> {
    return apiRequest<Vendor>(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
}
