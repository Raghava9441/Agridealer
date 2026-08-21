import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'

export const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
})
export type AddressInput = z.infer<typeof addressSchema>

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  gstin: z.string().optional(),
  address: addressSchema.optional(),
  creditLimitPaise: z.number().int().min(0).default(0),
  creditDays: z.number().int().min(0).default(0),
})
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
})
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export const listCustomersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>
