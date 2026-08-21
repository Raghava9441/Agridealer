import { Schema } from 'mongoose'

/** Shared subdocument shape — used by Customer and Vendor, not a standalone collection. */
export interface IAddress {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false },
)
