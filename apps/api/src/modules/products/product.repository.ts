import type { ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { Product, type IProduct } from './product.model'

export class ProductRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string, session?: ClientSession) {
    return Product.findOne(this.scope({ _id: id })).session(session ?? null)
  }

  findBySku(sku: string) {
    return Product.findOne(this.scope({ sku }))
  }

  list(filter: Partial<Pick<IProduct, 'category' | 'status'>> & { search?: string } = {}) {
    const { search, ...rest } = filter
    const query = this.scope(rest) as Record<string, unknown>
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: pattern }, { sku: pattern }]
    }
    return Product.find(query).sort({ name: 1 })
  }

  create(input: Partial<IProduct>) {
    return Product.create({ ...input, tenantId: this.ctx.tenantId })
  }
}
