import { Schema, model, type Document } from 'mongoose'
import { addressSchema, type IAddress } from '../../shared/schemas/address.schema'

export type VendorStatus = 'active' | 'inactive'

/**
 * currentBalancePaise mirrors Customer.currentBalancePaise but for the
 * opposite direction: positive = the dealer owes this vendor. Same rule —
 * only ever changed alongside the CreditLedgerEntry that justifies it.
 */
export interface IVendor extends Document {
  tenantId: string
  name: string
  phone: string
  email?: string
  gstin?: string
  address?: IAddress
  currentBalancePaise: number
  status: VendorStatus
  createdAt: Date
  updatedAt: Date
}

const vendorSchema = new Schema<IVendor>(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    gstin: { type: String, trim: true },
    address: { type: addressSchema },
    currentBalancePaise: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
)

vendorSchema.index({ tenantId: 1, phone: 1 }, { unique: true })
vendorSchema.index({ tenantId: 1, name: 1 })

export const Vendor = model<IVendor>('Vendor', vendorSchema)
