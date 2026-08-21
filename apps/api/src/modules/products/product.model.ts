import { Schema, model, type Document } from 'mongoose'

export type ProductUnit = 'kg' | 'litre' | 'bag' | 'piece' | 'box'
export type ProductStatus = 'active' | 'discontinued'

/** Catalogue item (agri-input: seed, fertilizer, pesticide, ...). */
export interface IProduct extends Document {
  tenantId: string
  sku: string
  name: string
  category: string
  unit: ProductUnit
  hsnCode: string
  gstRatePercent: number
  brand?: string
  description?: string
  /** Whether stock/expiry is tracked per batch (true for most agrochemicals/seed). */
  batchTracked: boolean
  reorderLevel: number
  status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    tenantId: { type: String, required: true },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    unit: { type: String, required: true, enum: ['kg', 'litre', 'bag', 'piece', 'box'] },
    hsnCode: { type: String, required: true },
    gstRatePercent: { type: Number, required: true, min: 0, max: 28 },
    brand: { type: String },
    description: { type: String },
    batchTracked: { type: Boolean, required: true, default: true },
    reorderLevel: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'discontinued'], default: 'active' },
  },
  { timestamps: true },
)

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true })
productSchema.index({ tenantId: 1, name: 1 })
productSchema.index({ tenantId: 1, status: 1 })

export const Product = model<IProduct>('Product', productSchema)
