import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { GoodsReceipt, type IGoodsReceipt } from './goodsReceipt.model'

export class GoodsReceiptRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return GoodsReceipt.findOne(this.scope({ _id: id }))
  }

  listForPurchaseOrder(purchaseOrderId: string) {
    return GoodsReceipt.find(this.scope({ purchaseOrderId })).sort({ receivedAt: -1 })
  }

  list(filter: { vendorId?: string; purchaseOrderId?: string } = {}) {
    return GoodsReceipt.find(this.scope(filter)).sort({ receivedAt: -1 })
  }

  async create(input: AnyKeys<IGoodsReceipt>, session?: ClientSession): Promise<IGoodsReceipt> {
    const [grn] = await GoodsReceipt.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!grn) {
      throw new Error('GoodsReceipt.create returned no document')
    }
    return grn
  }
}
