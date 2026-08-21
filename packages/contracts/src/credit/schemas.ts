import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'

export const paymentAllocationInputSchema = z.object({
  invoiceId: z.string().min(1),
  amountPaise: z.number().int().positive(),
})
export type PaymentAllocationInput = z.infer<typeof paymentAllocationInputSchema>

export const createPaymentSchema = z.object({
  customerId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'cheque']),
  referenceNumber: z.string().optional(),
  appliedTo: z.array(paymentAllocationInputSchema).default([]),
})
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

export const listPaymentsQuerySchema = paginationQuerySchema.extend({
  customerId: z.string().optional(),
})
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>
