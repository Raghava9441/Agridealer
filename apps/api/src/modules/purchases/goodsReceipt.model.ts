import { Schema, model, type Document, type Types } from 'mongoose'

export interface IGoodsReceiptLine {
  productId: Types.ObjectId
  batchNumber: string
  mfgDate?: Date
  expiryDate?: Date
  quantity: number
  unitCostPaise: number
  mrpPaise: number
}

/**
 * The physical receiving event — distinct from PurchaseOrder (the intent to
 * buy) and VendorBill (the financial claim). Recording a GRN is what
 * creates/tops-up ProductBatch rows and writes the corresponding
 * StockMovement('in') entries; see the Procurement flow in dbstructure.md.
 */
export interface IGoodsReceipt extends Document {
  tenantId: string
  grnNumber: string
  purchaseOrderId?: Types.ObjectId
  vendorId: Types.ObjectId
  lines: IGoodsReceiptLine[]
  receivedBy: Types.ObjectId
  receivedAt: Date
}

const goodsReceiptLineSchema = new Schema<IGoodsReceiptLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchNumber: { type: String, required: true },
    mfgDate: { type: Date },
    expiryDate: { type: Date },
    quantity: { type: Number, required: true, min: 0 },
    unitCostPaise: { type: Number, required: true, min: 0 },
    mrpPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const goodsReceiptSchema = new Schema<IGoodsReceipt>({
  tenantId: { type: String, required: true },
  grnNumber: { type: String, required: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  lines: { type: [goodsReceiptLineSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receivedAt: { type: Date, required: true, default: Date.now },
})

goodsReceiptSchema.index({ tenantId: 1, grnNumber: 1 }, { unique: true })
goodsReceiptSchema.index({ tenantId: 1, vendorId: 1 })
goodsReceiptSchema.index({ tenantId: 1, purchaseOrderId: 1 })

export const GoodsReceipt = model<IGoodsReceipt>('GoodsReceipt', goodsReceiptSchema)
