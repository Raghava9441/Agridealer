import type { Request, Response } from 'express'
import { z } from 'zod'
import { expiringBatchesQuerySchema } from '@agridealer/contracts'
import { InventoryService } from './inventory.service'
import { ProductRepository } from '../products/product.repository'
import { ProductBatchRepository } from '../products/productBatch.repository'
import { StockMovementRepository } from './stockMovement.repository'
import { sendSuccess } from '../../shared/http/respond'

const productIdParamSchema = z.object({ productId: z.string().min(1) })

function serviceFor(req: Request): InventoryService {
  const ctx = { tenantId: req.tenant.id }
  return new InventoryService(new ProductRepository(ctx), new ProductBatchRepository(ctx), new StockMovementRepository(ctx))
}

export const inventoryController = {
  async stockSummary(req: Request, res: Response) {
    const { productId } = productIdParamSchema.parse(req.params)
    const summary = await serviceFor(req).getStockSummary(productId)

    sendSuccess(req, res, summary)
  },

  async batches(req: Request, res: Response) {
    const { productId } = productIdParamSchema.parse(req.params)
    const batches = await serviceFor(req).listBatches(productId)

    sendSuccess(req, res, batches)
  },

  async movements(req: Request, res: Response) {
    const { productId } = productIdParamSchema.parse(req.params)
    const movements = await serviceFor(req).listMovements(productId)

    sendSuccess(req, res, movements)
  },

  async expiring(req: Request, res: Response) {
    const query = expiringBatchesQuerySchema.parse(req.query)
    const batches = await serviceFor(req).listExpiring(query.days)

    sendSuccess(req, res, batches)
  },
}
