import { Schema, model, type Document } from 'mongoose'
import type { Role } from '@agridealer/contracts'

/** Staff account — role, MFA secret, token version (docs §7.2, §11.1). */
export interface IUser extends Document {
  tenantId: string
  name: string
  email: string
  passwordHash: string
  role: Role
  status: 'active' | 'disabled'
  tokenVersion: number
  mfaEnabled: boolean
  mfaSecret?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['owner', 'manager', 'sales', 'accountant', 'warehouse'] },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    tokenVersion: { type: Number, required: true, default: 0 },
    mfaEnabled: { type: Boolean, required: true, default: false },
    // NOTE: production deployments must field-level-encrypt this (docs §11.3).
    mfaSecret: { type: String, select: false },
  },
  { timestamps: true },
)

userSchema.index({ tenantId: 1, email: 1 }, { unique: true })

export const User = model<IUser>('User', userSchema)
