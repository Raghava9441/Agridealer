import { Schema, model, type Document, type Types } from 'mongoose'

export type CashbookDayStatus = 'open' | 'closed'

/**
 * One document per tenant per calendar day — the day-open/close and
 * reconciliation record. It does not duplicate individual cash movements;
 * those already exist as Payment(method: 'cash') and Expense(paymentMethod:
 * 'cash') rows plus cash Invoice collections for the same date range.
 * systemComputedClosingPaise is what a future reconciliation service derives
 * from those rows; closingBalancePaise is what staff physically counted —
 * the gap between the two is the reconciliation variance.
 */
export interface ICashbookDay extends Document {
  tenantId: string
  date: Date
  openingBalancePaise: number
  closingBalancePaise?: number
  systemComputedClosingPaise?: number
  status: CashbookDayStatus
  openedBy: Types.ObjectId
  closedBy?: Types.ObjectId
  openedAt: Date
  closedAt?: Date
  reconciliationNotes?: string
  createdAt: Date
  updatedAt: Date
}

const cashbookDaySchema = new Schema<ICashbookDay>(
  {
    tenantId: { type: String, required: true },
    date: { type: Date, required: true },
    openingBalancePaise: { type: Number, required: true, min: 0 },
    closingBalancePaise: { type: Number, min: 0 },
    systemComputedClosingPaise: { type: Number, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    openedAt: { type: Date, required: true, default: Date.now },
    closedAt: { type: Date },
    reconciliationNotes: { type: String },
  },
  { timestamps: true },
)

cashbookDaySchema.index({ tenantId: 1, date: 1 }, { unique: true })
cashbookDaySchema.index({ tenantId: 1, status: 1 })

export const CashbookDay = model<ICashbookDay>('CashbookDay', cashbookDaySchema)
