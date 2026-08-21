import type { CreateCustomerInput, UpdateCustomerInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'

export interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  gstin?: string
  creditLimitPaise: number
  creditDays: number
  currentBalancePaise: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (search: string) => [...customersKeys.lists(), { search }] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
}

/** Talks to apps/api/src/modules/customers/customers.routes.ts. */
export const customersApi = {
  list(search?: string): Promise<Customer[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiRequest<Customer[]>(`/customers${qs}`)
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
