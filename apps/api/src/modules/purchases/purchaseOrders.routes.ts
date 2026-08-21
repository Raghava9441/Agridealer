import { Router } from 'express'
import { purchaseOrdersController } from './purchaseOrders.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { idempotent } from '../../middleware/idempotency'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const purchaseOrdersRoutes = Router()

purchaseOrdersRoutes.get('/', asyncHandler(purchaseOrdersController.list))
purchaseOrdersRoutes.get('/:id', asyncHandler(purchaseOrdersController.get))

purchaseOrdersRoutes.post(
  '/',
  authorize('purchases:manage'),
  idempotent(),
  auditAction('PURCHASE_ORDER_CREATE'),
  asyncHandler(purchaseOrdersController.create),
)

purchaseOrdersRoutes.post(
  '/:id/cancel',
  authorize('purchases:manage'),
  idempotent(),
  auditAction('PURCHASE_ORDER_CANCEL'),
  asyncHandler(purchaseOrdersController.cancel),
)
