import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'
import { addressSchema } from '../customers/schemas'

export const createVendorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  gstin: z.string().optional(),
  address: addressSchema.optional(),
})
export type CreateVendorInput = z.infer<typeof createVendorSchema>

export const updateVendorSchema = createVendorSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
})
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>

export const listVendorsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>
