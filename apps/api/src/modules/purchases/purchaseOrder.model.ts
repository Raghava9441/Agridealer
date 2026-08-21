import { Schema, model, type Document, type Types } from 'mongoose'

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled'

export interface IPurchaseOrderLine {
  productId: Types.ObjectId
  quantity: number
  unitCostPaise: number
  /** Running total received so far across all linked GoodsReceipts — only GoodsReceiptsService mutates this. */
  receivedQuantity: number
}

export interface IPurchaseOrder extends Document {
  tenantId: string
  poNumber: string
  vendorId: Types.ObjectId
  lines: IPurchaseOrderLine[]
  status: PurchaseOrderStatus
  expectedDate?: Date
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const purchaseOrderLineSchema = new Schema<IPurchaseOrderLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitCostPaise: { type: Number, required: true, min: 0 },
    receivedQuantity: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false },
)

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    tenantId: { type: String, required: true },
    poNumber: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lines: { type: [purchaseOrderLineSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    status: {
      type: String,
      enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'],
      default: 'draft',
    },
    expectedDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true })
purchaseOrderSchema.index({ tenantId: 1, vendorId: 1 })
purchaseOrderSchema.index({ tenantId: 1, status: 1 })

export const PurchaseOrder = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema)
