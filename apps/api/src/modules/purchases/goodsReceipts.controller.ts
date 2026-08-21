import type { Request, Response } from 'express'
import { z } from 'zod'
import { createGoodsReceiptSchema, listGoodsReceiptsQuerySchema } from '@agridealer/contracts'
import { GoodsReceiptsService } from './goodsReceipts.service'
import { GoodsReceiptRepository } from './goodsReceipt.repository'
import { PurchaseOrderRepository } from './purchaseOrder.repository'
import { VendorRepository } from './vendor.repository'
import { ProductBatchRepository } from '../products/productBatch.repository'
import { StockMovementRepository } from '../inventory/stockMovement.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): GoodsReceiptsService {
  const ctx = { tenantId: req.tenant.id }
  return new GoodsReceiptsService(
    req.tenant.id,
    new GoodsReceiptRepository(ctx),
    new PurchaseOrderRepository(ctx),
    new VendorRepository(ctx),
    new ProductBatchRepository(ctx),
    new StockMovementRepository(ctx),
  )
}

export const goodsReceiptsController = {
  async create(req: Request, res: Response) {
    const input = createGoodsReceiptSchema.parse(req.body)
    const grn = await serviceFor(req).receive(input, req.user.userId)

    req.auditEntity = {
      type: 'GoodsReceipt',
      id: grn.id,
      after: { grnNumber: grn.grnNumber, vendorId: grn.vendorId, lineCount: grn.lines.length },
    }

    sendSuccess(req, res, grn, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listGoodsReceiptsQuerySchema.parse(req.query)
    const receipts = await serviceFor(req).list({ vendorId: query.vendorId, purchaseOrderId: query.purchaseOrderId })

    sendSuccess(req, res, receipts)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const grn = await serviceFor(req).get(id)

    sendSuccess(req, res, grn)
  },
}
