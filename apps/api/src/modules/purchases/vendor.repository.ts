import type { TenantContext } from '../../shared/types/tenantContext'
import { Vendor, type IVendor } from './vendor.model'

export class VendorRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return Vendor.findOne(this.scope({ _id: id }))
  }

  findByPhone(phone: string) {
    return Vendor.findOne(this.scope({ phone }))
  }

  list(filter: Partial<Pick<IVendor, 'status'>> & { search?: string } = {}) {
    const { search, ...rest } = filter
    const query = this.scope(rest) as Record<string, unknown>
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: pattern }, { phone: pattern }]
    }
    return Vendor.find(query).sort({ name: 1 })
  }

  create(input: Partial<IVendor>) {
    return Vendor.create({ ...input, tenantId: this.ctx.tenantId })
  }
}
