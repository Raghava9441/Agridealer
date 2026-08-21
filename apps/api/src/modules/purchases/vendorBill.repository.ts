import type { TenantContext } from '../../shared/types/tenantContext'
import { VendorBill, type IVendorBill } from './vendorBill.model'

export class VendorBillRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return VendorBill.findOne(this.scope({ _id: id }))
  }

  listForVendor(vendorId: string) {
    return VendorBill.find(this.scope({ vendorId })).sort({ createdAt: -1 })
  }

  listUnpaid() {
    return VendorBill.find(this.scope({ status: { $in: ['unpaid', 'partially_paid'] } })).sort({ dueDate: 1 })
  }

  create(input: Partial<IVendorBill>) {
    return VendorBill.create({ ...input, tenantId: this.ctx.tenantId })
  }
}
