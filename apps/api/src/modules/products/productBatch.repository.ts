import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { ProductBatch, type IProductBatch } from './productBatch.model'

export class ProductBatchRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findById(id: string) {
    return ProductBatch.findOne(this.scope({ _id: id }))
  }

  findByProductAndBatchNumber(productId: string, batchNumber: string, session?: ClientSession) {
    return ProductBatch.findOne(this.scope({ productId, batchNumber })).session(session ?? null)
  }

  listForProduct(productId: string, onlyActive = true) {
    return ProductBatch.find(this.scope({ productId, ...(onlyActive ? { status: 'active' } : {}) })).sort({
      expiryDate: 1,
    })
  }

  listExpiringBefore(date: Date) {
    return ProductBatch.find(this.scope({ status: 'active', expiryDate: { $lte: date } }))
  }

  /**
   * Sellable stock for FEFO allocation: active, unexpired, with quantity left.
   * Two queries concatenated rather than one sorted query — Mongo's ascending
   * sort puts missing/null `expiryDate` *first*, which would consume
   * non-expiring stock before expiring stock and defeat the point of FEFO.
   */
  async listAvailableForConsumption(productId: string, session?: ClientSession): Promise<IProductBatch[]> {
    const now = new Date()
    const withExpiry = await ProductBatch.find(
      this.scope({ productId, status: 'active', quantityAvailable: { $gt: 0 }, expiryDate: { $gt: now } }),
    )
      .sort({ expiryDate: 1 })
      .session(session ?? null)
    const withoutExpiry = await ProductBatch.find(
      this.scope({ productId, status: 'active', quantityAvailable: { $gt: 0 }, expiryDate: null }),
    ).session(session ?? null)
    return [...withExpiry, ...withoutExpiry]
  }

  /** Atomic conditional decrement — returns null (not an error) if the batch no longer has `quantity` available; the caller decides what that means. */
  async tryConsume(id: string, quantity: number, session?: ClientSession): Promise<IProductBatch | null> {
    return ProductBatch.findOneAndUpdate(
      this.scope({ _id: id, quantityAvailable: { $gte: quantity } }),
      { $inc: { quantityAvailable: -quantity } },
      { new: true, session },
    )
  }

  async create(input: AnyKeys<IProductBatch>, session?: ClientSession): Promise<IProductBatch> {
    const [batch] = await ProductBatch.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!batch) {
      throw new Error('ProductBatch.create returned no document')
    }
    return batch
  }

  /** Tops up an existing batch's received/available quantity by `delta` — used when a later GRN receives more of the same manufacturer batch. */
  async incrementQuantity(id: string, delta: number, session?: ClientSession): Promise<IProductBatch> {
    const batch = await ProductBatch.findOneAndUpdate(
      this.scope({ _id: id }),
      { $inc: { quantityReceived: delta, quantityAvailable: delta } },
      { new: true, session },
    )
    if (!batch) {
      throw new Error(`ProductBatch ${id} not found during incrementQuantity`)
    }
    return batch
  }
}
