import { Schema, model, type Document } from 'mongoose'
import { addressSchema, type IAddress } from '../../shared/schemas/address.schema'

export type CustomerStatus = 'active' | 'inactive'

/**
 * currentBalancePaise is a denormalized cache of CreditLedgerEntry rows for
 * this customer (positive = customer owes the dealer). It must only be
 * changed in the same transaction as the ledger entry that justifies the
 * change — never edited directly.
 */
export interface ICustomer extends Document {
  tenantId: string
  name: string
  phone: string
  email?: string
  gstin?: string
  address?: IAddress
  creditLimitPaise: number
  creditDays: number
  currentBalancePaise: number
  status: CustomerStatus
  createdAt: Date
  updatedAt: Date
}

const customerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    gstin: { type: String, trim: true },
    address: { type: addressSchema },
    creditLimitPaise: { type: Number, required: true, default: 0, min: 0 },
    creditDays: { type: Number, required: true, default: 0, min: 0 },
    currentBalancePaise: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
)

customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true })
customerSchema.index({ tenantId: 1, name: 1 })

export const Customer = model<ICustomer>('Customer', customerSchema)
