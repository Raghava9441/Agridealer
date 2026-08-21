import { Schema, model, type Document, type Types } from 'mongoose'

export type VendorBillStatus = 'unpaid' | 'partially_paid' | 'paid' | 'cancelled'

export interface IVendorBillLine {
  productId: Types.ObjectId
  quantity: number
  unitCostPaise: number
  taxRatePercent: number
  taxAmountPaise: number
  lineTotalPaise: number
}

/** The vendor's own invoice against us — the financial document, separate from the physical GRN. */
export interface IVendorBill extends Document {
  tenantId: string
  billNumber: string
  vendorId: Types.ObjectId
  purchaseOrderId?: Types.ObjectId
  goodsReceiptId?: Types.ObjectId
  lines: IVendorBillLine[]
  subtotalPaise: number
  taxTotalPaise: number
  grandTotalPaise: number
  amountPaidPaise: number
  dueDate?: Date
  status: VendorBillStatus
  createdAt: Date
  updatedAt: Date
}

const vendorBillLineSchema = new Schema<IVendorBillLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitCostPaise: { type: Number, required: true, min: 0 },
    taxRatePercent: { type: Number, required: true, min: 0, max: 28 },
    taxAmountPaise: { type: Number, required: true, min: 0 },
    lineTotalPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const vendorBillSchema = new Schema<IVendorBill>(
  {
    tenantId: { type: String, required: true },
    billNumber: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    goodsReceiptId: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt' },
    lines: { type: [vendorBillLineSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    subtotalPaise: { type: Number, required: true, min: 0 },
    taxTotalPaise: { type: Number, required: true, min: 0 },
    grandTotalPaise: { type: Number, required: true, min: 0 },
    amountPaidPaise: { type: Number, required: true, default: 0, min: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ['unpaid', 'partially_paid', 'paid', 'cancelled'], default: 'unpaid' },
  },
  { timestamps: true },
)

vendorBillSchema.index({ tenantId: 1, vendorId: 1, billNumber: 1 }, { unique: true })
vendorBillSchema.index({ tenantId: 1, status: 1 })
vendorBillSchema.index({ tenantId: 1, dueDate: 1 })

export const VendorBill = model<IVendorBill>('VendorBill', vendorBillSchema)
