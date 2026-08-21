import type { TenantContext } from '../../shared/types/tenantContext'
import { CashbookDay, type ICashbookDay } from './cashbookDay.model'

export class CashbookDayRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findByDate(date: Date) {
    return CashbookDay.findOne(this.scope({ date }))
  }

  findOpenDay() {
    return CashbookDay.findOne(this.scope({ status: 'open' }))
  }

  create(input: Partial<ICashbookDay>) {
    return CashbookDay.create({ ...input, tenantId: this.ctx.tenantId })
  }

  close(id: string, update: Pick<ICashbookDay, 'closingBalancePaise' | 'closedBy'> & { reconciliationNotes?: string }) {
    return CashbookDay.findOneAndUpdate(
      this.scope({ _id: id, status: 'open' }),
      { ...update, status: 'closed', closedAt: new Date() },
      { new: true },
    )
  }
}
