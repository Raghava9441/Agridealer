import type { TenantContext } from '../../shared/types/tenantContext'
import { Expense, type IExpense } from './expense.model'

export class ExpenseRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return Expense.findOne(this.scope({ _id: id }))
  }

  listBetween(startDate: Date, endDate: Date) {
    return Expense.find(this.scope({ expenseDate: { $gte: startDate, $lte: endDate } })).sort({ expenseDate: -1 })
  }

  create(input: Partial<IExpense>) {
    return Expense.create({ ...input, tenantId: this.ctx.tenantId })
  }
}
