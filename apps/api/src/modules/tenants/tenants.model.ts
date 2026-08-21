import { Schema, model, type Document } from 'mongoose'
import { TENANT_SLUG_PATTERN } from '@agridealer/contracts'
import { addressSchema, type IAddress } from '../../shared/schemas/address.schema'

export type TenantStatus = 'active' | 'suspended' | 'trial'

/** Dealer shop record — plan, features, timezone, branding (docs §7.2). */
export interface ITenant extends Document {
  name: string
  slug: string
  status: TenantStatus
  plan: string
  features: string[]
  timezone: string
  /** Business-profile fields — shown on the printable bill letterhead, edited via Settings. */
  address?: IAddress
  gstin?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    /** Subdomain label (shopname.agridealer.app) — resolved pre-login by subdomainResolver. */
    slug: { type: String, required: true, lowercase: true, trim: true, match: TENANT_SLUG_PATTERN },
    status: { type: String, enum: ['active', 'suspended', 'trial'], default: 'trial' },
    plan: { type: String, required: true, default: 'starter' },
    features: { type: [String], default: [] },
    timezone: { type: String, required: true, default: 'Asia/Kolkata' },
    address: { type: addressSchema },
    gstin: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true },
)

tenantSchema.index({ slug: 1 }, { unique: true })

export const Tenant = model<ITenant>('Tenant', tenantSchema)
