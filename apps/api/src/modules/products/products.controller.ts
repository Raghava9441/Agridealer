import type { Request, Response } from 'express'
import { z } from 'zod'
import { createProductSchema, updateProductSchema, listProductsQuerySchema } from '@agridealer/contracts'
import { ProductsService } from './products.service'
import { ProductRepository } from './product.repository'
import { sendSuccess } from '../../shared/http/respond'

const idParamSchema = z.object({ id: z.string().min(1) })

function serviceFor(req: Request): ProductsService {
  return new ProductsService(new ProductRepository({ tenantId: req.tenant.id }))
}

export const productsController = {
  async create(req: Request, res: Response) {
    const input = createProductSchema.parse(req.body)
    const product = await serviceFor(req).create(input)

    req.auditEntity = { type: 'Product', id: product.id, after: { sku: product.sku, name: product.name } }

    sendSuccess(req, res, product, { status: 201 })
  },

  async list(req: Request, res: Response) {
    const query = listProductsQuerySchema.parse(req.query)
    const products = await serviceFor(req).list({ search: query.search, category: query.category, status: query.status })

    sendSuccess(req, res, products)
  },

  async get(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const product = await serviceFor(req).get(id)

    sendSuccess(req, res, product)
  },

  async update(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params)
    const input = updateProductSchema.parse(req.body)
    const { before, after } = await serviceFor(req).update(id, input)

    req.auditEntity = {
      type: 'Product',
      id: after.id,
      before,
      after: { name: after.name, sku: after.sku, gstRatePercent: after.gstRatePercent, status: after.status },
    }

    sendSuccess(req, res, after)
  },
}
