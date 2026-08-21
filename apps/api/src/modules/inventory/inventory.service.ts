import { AppError } from '../../shared/errors/AppError'
import type { ProductRepository } from '../products/product.repository'
import type { ProductBatchRepository } from '../products/productBatch.repository'
import type { StockMovementRepository } from './stockMovement.repository'

export interface StockSummary {
  productId: string
  productName: string
  unit: string
  reorderLevel: number
  totalQuantityAvailable: number
  batchCount: number
  nearestExpiryDate: Date | null
  isLowStock: boolean
}

/**
 * Read-only views over data that's been written by GoodsReceiptsService and
 * InvoicesService — no mutation happens here, so nothing in this file needs
 * a transaction. Fills the gap where GRN/Invoice could change stock but
 * nothing exposed a way to see current stock afterward.
 */
export class InventoryService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly productBatchRepo: ProductBatchRepository,
    private readonly stockMovementRepo: StockMovementRepository,
  ) {}

  async getStockSummary(productId: string): Promise<StockSummary> {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw new AppError('NOT_FOUND', { productId })
    }

    const batches = await this.productBatchRepo.listForProduct(productId, true)
    const withStock = batches.filter((batch) => batch.quantityAvailable > 0)
    const totalQuantityAvailable = withStock.reduce((sum, batch) => sum + batch.quantityAvailable, 0)
    const nearestExpiryDate = withStock.reduce<Date | null>((earliest, batch) => {
      if (!batch.expiryDate) return earliest
      if (!earliest || batch.expiryDate < earliest) return batch.expiryDate
      return earliest
    }, null)

    return {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      reorderLevel: product.reorderLevel,
      totalQuantityAvailable,
      batchCount: withStock.length,
      nearestExpiryDate,
      isLowStock: totalQuantityAvailable <= product.reorderLevel,
    }
  }

  async listBatches(productId: string) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw new AppError('NOT_FOUND', { productId })
    }
    return this.productBatchRepo.listForProduct(productId, false)
  }

  async listMovements(productId: string) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw new AppError('NOT_FOUND', { productId })
    }
    return this.stockMovementRepo.listForProduct(productId)
  }

  listExpiring(days: number) {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    return this.productBatchRepo.listExpiringBefore(cutoff)
  }
}
