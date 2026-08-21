import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'

export const purchaseOrderLineInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
  unitCostPaise: z.number().int().min(0),
})
export type PurchaseOrderLineInput = z.infer<typeof purchaseOrderLineInputSchema>

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1),
  lines: z.array(purchaseOrderLineInputSchema).min(1),
  expectedDate: z.coerce.date().optional(),
})
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>

export const listPurchaseOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['draft', 'ordered', 'partially_received', 'received', 'cancelled']).optional(),
  vendorId: z.string().optional(),
})
export type ListPurchaseOrdersQuery = z.infer<typeof listPurchaseOrdersQuerySchema>

export const goodsReceiptLineInputSchema = z.object({
  productId: z.string().min(1),
  batchNumber: z.string().min(1),
  mfgDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  quantity: z.number().positive(),
  unitCostPaise: z.number().int().min(0),
  mrpPaise: z.number().int().min(0),
})
export type GoodsReceiptLineInput = z.infer<typeof goodsReceiptLineInputSchema>

export const createGoodsReceiptSchema = z.object({
  vendorId: z.string().min(1),
  purchaseOrderId: z.string().min(1).optional(),
  lines: z.array(goodsReceiptLineInputSchema).min(1),
})
export type CreateGoodsReceiptInput = z.infer<typeof createGoodsReceiptSchema>

export const listGoodsReceiptsQuerySchema = paginationQuerySchema.extend({
  vendorId: z.string().optional(),
  purchaseOrderId: z.string().optional(),
})
export type ListGoodsReceiptsQuery = z.infer<typeof listGoodsReceiptsQuerySchema>
