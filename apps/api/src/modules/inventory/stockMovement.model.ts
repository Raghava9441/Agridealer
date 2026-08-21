import { Schema, model, type Document, type Types } from 'mongoose'

export type StockDirection = 'in' | 'out'
export type StockMovementReason =
  | 'purchase_receipt'
  | 'sale'
  | 'sale_return'
  | 'purchase_return'
  | 'adjustment'
  | 'transfer'
export type StockReferenceType = 'PurchaseOrder' | 'GoodsReceipt' | 'Invoice'

/**
 * Append-only stock ledger — the source of truth for on-hand quantity.
 * No update or delete path exists on this model by design, same
 * immutability rule as AuditLog (audit.model.ts). Any correction is a new
 * offsetting movement, never a mutation of a past one.
 */
export interface IStockMovement extends Document {
  tenantId: string
  productId: Types.ObjectId
  batchId?: Types.ObjectId
  direction: StockDirection
  quantity: number
  reason: StockMovementReason
  unitCostPaise: number
  /** Omitted for freeform manual adjustments, which have no source document to point at. */
  referenceType?: StockReferenceType
  referenceId?: Types.ObjectId
  performedBy: Types.ObjectId
  notes?: string
  performedAt: Date
}

const stockMovementSchema = new Schema<IStockMovement>({
  tenantId: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'ProductBatch' },
  direction: { type: String, enum: ['in', 'out'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  reason: {
    type: String,
    required: true,
    enum: ['purchase_receipt', 'sale', 'sale_return', 'purchase_return', 'adjustment', 'transfer'],
  },
  unitCostPaise: { type: Number, required: true, min: 0 },
  referenceType: { type: String, enum: ['PurchaseOrder', 'GoodsReceipt', 'Invoice'] },
  referenceId: { type: Schema.Types.ObjectId, refPath: 'referenceType' },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  performedAt: { type: Date, required: true, default: Date.now },
})

stockMovementSchema.index({ tenantId: 1, productId: 1, performedAt: -1 })
stockMovementSchema.index({ tenantId: 1, batchId: 1 })
stockMovementSchema.index({ tenantId: 1, referenceType: 1, referenceId: 1 })

export const StockMovement = model<IStockMovement>('StockMovement', stockMovementSchema)
