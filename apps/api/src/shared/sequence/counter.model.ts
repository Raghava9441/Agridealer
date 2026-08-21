import { Schema, model, type Document } from 'mongoose'

/**
 * Backing store for nextSequence() (sequence.service.ts). One document per
 * (tenantId, name) pair — e.g. (tenant A, 'invoice') — incremented atomically
 * so concurrent requests never hand out the same business-visible number.
 */
export interface ICounter extends Document {
  tenantId: string
  name: string
  seq: number
}

const counterSchema = new Schema<ICounter>({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
})

counterSchema.index({ tenantId: 1, name: 1 }, { unique: true })

export const Counter = model<ICounter>('Counter', counterSchema)
