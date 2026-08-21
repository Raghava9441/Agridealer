import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'

export const createInvoiceLineInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
  unitPricePaise: z.number().int().min(0),
  discountPaise: z.number().int().min(0).default(0),
})
export type CreateInvoiceLineInput = z.infer<typeof createInvoiceLineInputSchema>

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1).optional(),
  lines: z.array(createInvoiceLineInputSchema).min(1),
})
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

export const listInvoicesQuerySchema = paginationQuerySchema.extend({
  customerId: z.string().optional(),
  status: z.enum(['draft', 'held', 'finalized', 'cancelled']).optional(),
})
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>
