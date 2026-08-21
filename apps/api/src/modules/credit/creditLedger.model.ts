import { Schema, model, type Document, type Types } from 'mongoose'
import type { PartyModel, PartyType } from './payment.model'

export type CreditLedgerEntryType = 'invoice' | 'payment' | 'vendor_bill' | 'opening_balance' | 'adjustment'

/**
 * Append-only running ledger per customer/vendor — same immutability rule as
 * AuditLog and StockMovement. Customer.currentBalancePaise and
 * Vendor.currentBalancePaise are caches of the latest balanceAfterPaise
 * here; a correction is a new adjustment entry, never an edit of history.
 */
export interface ICreditLedgerEntry extends Document {
  tenantId: string
  partyType: PartyType
  partyModel: PartyModel
  partyId: Types.ObjectId
  entryType: CreditLedgerEntryType
  referenceType?: 'Invoice' | 'VendorBill' | 'Payment'
  referenceId?: Types.ObjectId
  debitPaise: number
  creditPaise: number
  balanceAfterPaise: number
  performedAt: Date
}

const creditLedgerEntrySchema = new Schema<ICreditLedgerEntry>({
  tenantId: { type: String, required: true },
  partyType: { type: String, enum: ['customer', 'vendor'], required: true },
  partyModel: { type: String, enum: ['Customer', 'Vendor'], required: true },
  partyId: { type: Schema.Types.ObjectId, required: true, refPath: 'partyModel' },
  entryType: {
    type: String,
    required: true,
    enum: ['invoice', 'payment', 'vendor_bill', 'opening_balance', 'adjustment'],
  },
  referenceType: { type: String, enum: ['Invoice', 'VendorBill', 'Payment'] },
  referenceId: { type: Schema.Types.ObjectId, refPath: 'referenceType' },
  debitPaise: { type: Number, required: true, default: 0, min: 0 },
  creditPaise: { type: Number, required: true, default: 0, min: 0 },
  balanceAfterPaise: { type: Number, required: true },
  performedAt: { type: Date, required: true, default: Date.now },
})

creditLedgerEntrySchema.index({ tenantId: 1, partyType: 1, partyId: 1, performedAt: -1 })

export const CreditLedgerEntry = model<ICreditLedgerEntry>('CreditLedgerEntry', creditLedgerEntrySchema)
