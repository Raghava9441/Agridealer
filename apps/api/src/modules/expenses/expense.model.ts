import { Schema, model, type Document, type Types } from 'mongoose'

export type ExpenseCategory = 'rent' | 'salary' | 'utilities' | 'transport' | 'maintenance' | 'marketing' | 'misc'
export type ExpensePaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque'

export interface IExpense extends Document {
  tenantId: string
  category: ExpenseCategory
  amountPaise: number
  description?: string
  paymentMethod: ExpensePaymentMethod
  expenseDate: Date
  recordedBy: Types.ObjectId
  attachmentUrl?: string
  createdAt: Date
  updatedAt: Date
}

const expenseSchema = new Schema<IExpense>(
  {
    tenantId: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['rent', 'salary', 'utilities', 'transport', 'maintenance', 'marketing', 'misc'],
    },
    amountPaise: { type: Number, required: true, min: 0 },
    description: { type: String },
    paymentMethod: { type: String, required: true, enum: ['cash', 'upi', 'bank_transfer', 'cheque'] },
    expenseDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attachmentUrl: { type: String },
  },
  { timestamps: true },
)

expenseSchema.index({ tenantId: 1, expenseDate: -1 })
expenseSchema.index({ tenantId: 1, category: 1 })

export const Expense = model<IExpense>('Expense', expenseSchema)
