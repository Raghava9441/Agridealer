import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { PurchaseOrder, type IPurchaseOrder } from './purchaseOrder.model'

export class PurchaseOrderRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  /** Returns a live document (not `.lean()`) so callers can mutate `.lines[]` and `.save({ session })` inside a transaction. */
  findById(id: string, session?: ClientSession) {
    return PurchaseOrder.findOne(this.scope({ _id: id })).session(session ?? null)
  }

  findByNumber(poNumber: string) {
    return PurchaseOrder.findOne(this.scope({ poNumber }))
  }

  list(filter: Partial<Pick<IPurchaseOrder, 'status'>> & { vendorId?: string } = {}) {
    return PurchaseOrder.find(this.scope(filter)).sort({ createdAt: -1 })
  }

  create(input: AnyKeys<IPurchaseOrder>) {
    return PurchaseOrder.create({ ...input, tenantId: this.ctx.tenantId })
  }
}
