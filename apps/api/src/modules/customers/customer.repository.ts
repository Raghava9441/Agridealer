import type { ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { Customer, type ICustomer } from './customer.model'

export class CustomerRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return Customer.findOne(this.scope({ _id: id }))
  }

  findByPhone(phone: string) {
    return Customer.findOne(this.scope({ phone }))
  }

  list(filter: Partial<Pick<ICustomer, 'status'>> & { search?: string } = {}) {
    const { search, ...rest } = filter
    const query = this.scope(rest) as Record<string, unknown>
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: pattern }, { phone: pattern }]
    }
    return Customer.find(query).sort({ name: 1 })
  }

  create(input: Partial<ICustomer>) {
    return Customer.create({ ...input, tenantId: this.ctx.tenantId })
  }

  /** Atomic `$inc` on the balance cache — returns the post-update document so callers (ledger writers) never need a separate read. */
  async incrementBalance(id: string, delta: number, session?: ClientSession): Promise<ICustomer> {
    const customer = await Customer.findOneAndUpdate(
      this.scope({ _id: id }),
      { $inc: { currentBalancePaise: delta } },
      { new: true, session },
    )
    if (!customer) {
      throw new Error(`Customer ${id} not found during incrementBalance`)
    }
    return customer
  }
}
