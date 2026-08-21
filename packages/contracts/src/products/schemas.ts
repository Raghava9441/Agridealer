import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'

export const PRODUCT_UNITS = ['kg', 'litre', 'bag', 'piece', 'box'] as const

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.enum(PRODUCT_UNITS),
  hsnCode: z.string().min(1),
  gstRatePercent: z.number().min(0).max(28),
  brand: z.string().optional(),
  description: z.string().optional(),
  batchTracked: z.boolean().default(true),
  reorderLevel: z.number().int().min(0).default(0),
})
export type CreateProductInput = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['active', 'discontinued']).optional(),
})
export type UpdateProductInput = z.infer<typeof updateProductSchema>

export const listProductsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'discontinued']).optional(),
})
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
