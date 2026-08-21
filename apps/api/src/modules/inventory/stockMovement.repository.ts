import type { AnyKeys, ClientSession } from 'mongoose'
import type { TenantContext } from '../../shared/types/tenantContext'
import { StockMovement, type IStockMovement } from './stockMovement.model'

/**
 * Append-only: intentionally exposes no update/delete method, matching
 * AuditLog (audit.model.ts). Correcting a movement means writing a new
 * offsetting one, not editing history.
 */
export class StockMovementRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  listForProduct(productId: string) {
    return StockMovement.find(this.scope({ productId })).sort({ performedAt: -1 })
  }

  listForBatch(batchId: string) {
    return StockMovement.find(this.scope({ batchId })).sort({ performedAt: -1 })
  }

  async record(input: AnyKeys<Omit<IStockMovement, 'tenantId'>>, session?: ClientSession): Promise<IStockMovement> {
    const [movement] = await StockMovement.create([{ ...input, tenantId: this.ctx.tenantId }], { session })
    if (!movement) {
      throw new Error('StockMovement.record returned no document')
    }
    return movement
  }
}
