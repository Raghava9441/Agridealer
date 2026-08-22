import type { CreateCustomerInput, UpdateCustomerInput, AddressInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  gstin?: string
  address?: AddressInput
  creditLimitPaise: number
  creditDays: number
  currentBalancePaise: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CustomerListFilter {
  search?: string
  status?: 'active' | 'inactive'
}

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (filter: CustomerListFilter) => [...customersKeys.lists(), filter] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/customers/customers.routes.ts. */
export const customersApi = {
  list(filter: CustomerListFilter = {}): Promise<Customer[]> {
    return apiRequest<Customer[]>(`/customers${buildQueryString(filter)}`)
  },
  get(id: string): Promise<Customer> {
    return apiRequest<Customer>(`/customers/${id}`)
  },
  create(input: CreateCustomerInput): Promise<Customer> {
    return apiRequest<Customer>('/customers', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    return apiRequest<Customer>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
}
