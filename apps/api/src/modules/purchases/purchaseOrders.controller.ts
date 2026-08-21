import type { Request, Response } from 'express'
import { z } from 'zod'
import { createPurchaseOrderSchema, listPurchaseOrdersQuerySchema } from '@agridealer/contracts'
import { PurchaseOrdersService } from './purchaseOrders.service'
import { PurchaseOrderRepository } from './purchaseOrder.repository'
import { VendorRepository } from './vendor.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): PurchaseOrdersService {
  const ctx = { tenantId: req.tenant.id }
  return new PurchaseOrdersService(req.tenant.id, new PurchaseOrderRepository(ctx), new VendorRepository(ctx))
}

export const purchaseOrdersController = {
  async create(req: Request, res: Response) {
    const input = createPurchaseOrderSchema.parse(req.body)
    const po = await serviceFor(req).create(input, req.user.userId)

    req.auditEntity = { type: 'PurchaseOrder', id: po.id, after: { poNumber: po.poNumber, vendorId: po.vendorId } }

    sendSuccess(req, res, po, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listPurchaseOrdersQuerySchema.parse(req.query)
    const orders = await serviceFor(req).list({ status: query.status, vendorId: query.vendorId })

    sendSuccess(req, res, orders)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const po = await serviceFor(req).get(id)

    sendSuccess(req, res, po)
  },

  async cancel(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const po = await serviceFor(req).cancel(id)

    req.auditEntity = { type: 'PurchaseOrder', id: po.id, after: { status: po.status } }

    sendSuccess(req, res, po)
  },
}
