import { Schema, model, type Document, type Types } from 'mongoose'

export type PaymentDirection = 'in' | 'out'
export type PartyType = 'customer' | 'vendor'
export type PartyModel = 'Customer' | 'Vendor'
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
export type AppliedDocumentType = 'Invoice' | 'VendorBill'

export interface IPaymentAllocation {
  documentType: AppliedDocumentType
  documentId: Types.ObjectId
  amountPaise: number
}

/**
 * A single money movement, in either direction. `direction: 'in'` is a
 * customer receipt (against one or more Invoices); `direction: 'out'` is a
 * vendor payment (against one or more VendorBills). partyModel mirrors
 * partyType (Customer/Vendor) so Mongoose's refPath can resolve the
 * polymorphic partyId at populate time.
 */
export interface IPayment extends Document {
  tenantId: string
  direction: PaymentDirection
  partyType: PartyType
  partyModel: PartyModel
  partyId: Types.ObjectId
  amountPaise: number
  method: PaymentMethod
  referenceNumber?: string
  appliedTo: IPaymentAllocation[]
  recordedBy: Types.ObjectId
  recordedAt: Date
}

const paymentAllocationSchema = new Schema<IPaymentAllocation>(
  {
    documentType: { type: String, enum: ['Invoice', 'VendorBill'], required: true },
    documentId: { type: Schema.Types.ObjectId, required: true, refPath: 'appliedTo.documentType' },
    amountPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const paymentSchema = new Schema<IPayment>({
  tenantId: { type: String, required: true },
  direction: { type: String, enum: ['in', 'out'], required: true },
  partyType: { type: String, enum: ['customer', 'vendor'], required: true },
  partyModel: { type: String, enum: ['Customer', 'Vendor'], required: true },
  partyId: { type: Schema.Types.ObjectId, required: true, refPath: 'partyModel' },
  amountPaise: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'], required: true },
  referenceNumber: { type: String },
  appliedTo: { type: [paymentAllocationSchema], default: [] },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recordedAt: { type: Date, required: true, default: Date.now },
})

paymentSchema.index({ tenantId: 1, partyType: 1, partyId: 1 })
paymentSchema.index({ tenantId: 1, recordedAt: -1 })

export const Payment = model<IPayment>('Payment', paymentSchema)
