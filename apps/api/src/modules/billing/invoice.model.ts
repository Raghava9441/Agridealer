import { Schema, model, type Document, type Types } from 'mongoose'

export type InvoicePaymentStatus = 'unpaid' | 'partially_paid' | 'paid'
export type InvoiceStatus = 'draft' | 'held' | 'finalized' | 'cancelled'

export interface IInvoiceLine {
  productId: Types.ObjectId
  batchId?: Types.ObjectId
  /** Snapshot of Product.name at sale time — an invoice must not change retroactively if the catalogue does. */
  productName: string
  quantity: number
  unitPricePaise: number
  discountPaise: number
  taxRatePercent: number
  taxAmountPaise: number
  lineTotalPaise: number
}

/**
 * The sales invoice / POS bill. Field shape (productId, productName,
 * quantity, unitPrice, discount) mirrors the client-side cart in
 * apps/web/src/features/billing/hooks/useCartStore.ts — the future billing
 * service converts that cart (rupee floats) into this persisted record
 * (paise integers) on finalize.
 */
export interface IInvoice extends Document {
  tenantId: string
  invoiceNumber: string
  customerId?: Types.ObjectId
  /** Snapshot of Customer.name at sale time, same reasoning as IInvoiceLine.productName. */
  customerName?: string
  lines: IInvoiceLine[]
  subtotalPaise: number
  discountTotalPaise: number
  taxTotalPaise: number
  grandTotalPaise: number
  amountPaidPaise: number
  paymentStatus: InvoicePaymentStatus
  status: InvoiceStatus
  soldBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const invoiceLineSchema = new Schema<IInvoiceLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'ProductBatch' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPricePaise: { type: Number, required: true, min: 0 },
    discountPaise: { type: Number, required: true, default: 0, min: 0 },
    taxRatePercent: { type: Number, required: true, min: 0, max: 28 },
    taxAmountPaise: { type: Number, required: true, min: 0 },
    lineTotalPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const invoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    lines: { type: [invoiceLineSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    subtotalPaise: { type: Number, required: true, min: 0 },
    discountTotalPaise: { type: Number, required: true, default: 0, min: 0 },
    taxTotalPaise: { type: Number, required: true, min: 0 },
    grandTotalPaise: { type: Number, required: true, min: 0 },
    amountPaidPaise: { type: Number, required: true, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
    status: { type: String, enum: ['draft', 'held', 'finalized', 'cancelled'], default: 'draft' },
    soldBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ tenantId: 1, customerId: 1 })
invoiceSchema.index({ tenantId: 1, createdAt: -1 })
invoiceSchema.index({ tenantId: 1, status: 1 })

export const Invoice = model<IInvoice>('Invoice', invoiceSchema)
