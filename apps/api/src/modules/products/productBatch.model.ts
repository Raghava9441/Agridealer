import { Schema, model, type Document, type Types } from 'mongoose'

export type ProductBatchStatus = 'active' | 'expired' | 'exhausted'

/**
 * A received lot of a product — its own cost, MRP, and expiry, independent
 * of every other lot of the same product. quantityAvailable is a
 * denormalized cache: the source of truth is the sum of StockMovement rows
 * for this batch, and only a service writing both in the same transaction
 * (docs "invoice + stock + ledger", see config/db.ts) may change it.
 */
export interface IProductBatch extends Document {
  tenantId: string
  productId: Types.ObjectId
  batchNumber: string
  mfgDate?: Date
  expiryDate?: Date
  purchasePricePaise: number
  mrpPaise: number
  quantityReceived: number
  quantityAvailable: number
  vendorId?: Types.ObjectId
  status: ProductBatchStatus
  createdAt: Date
  updatedAt: Date
}

const productBatchSchema = new Schema<IProductBatch>(
  {
    tenantId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchNumber: { type: String, required: true, trim: true },
    mfgDate: { type: Date },
    expiryDate: { type: Date },
    purchasePricePaise: { type: Number, required: true, min: 0 },
    mrpPaise: { type: Number, required: true, min: 0 },
    quantityReceived: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    status: { type: String, enum: ['active', 'expired', 'exhausted'], default: 'active' },
  },
  { timestamps: true },
)

productBatchSchema.index({ tenantId: 1, productId: 1, batchNumber: 1 }, { unique: true })
productBatchSchema.index({ tenantId: 1, expiryDate: 1 })
productBatchSchema.index({ tenantId: 1, productId: 1, status: 1 })

export const ProductBatch = model<IProductBatch>('ProductBatch', productBatchSchema)
