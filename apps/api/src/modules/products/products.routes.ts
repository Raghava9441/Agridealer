import { Router } from 'express'
import { productsController } from './products.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const productsRoutes = Router()

// No dedicated products:view permission — every authenticated role needs to
// look up a product (e.g. warehouse/sales during billing or receiving), so
// reads are gated by authenticate + tenantResolver only (applied where this mounts).
productsRoutes.get('/', asyncHandler(productsController.list))
productsRoutes.get('/:id', asyncHandler(productsController.get))

productsRoutes.post(
  '/',
  authorize('products:create'),
  auditAction('PRODUCT_CREATE'),
  asyncHandler(productsController.create),
)

productsRoutes.patch(
  '/:id',
  authorize('products:edit'),
  auditAction('PRODUCT_UPDATE'),
  asyncHandler(productsController.update),
)
