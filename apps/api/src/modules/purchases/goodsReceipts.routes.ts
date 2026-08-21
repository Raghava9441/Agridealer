import { Router } from 'express'
import { goodsReceiptsController } from './goodsReceipts.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { idempotent } from '../../middleware/idempotency'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const goodsReceiptsRoutes = Router()

goodsReceiptsRoutes.get('/', asyncHandler(goodsReceiptsController.list))
goodsReceiptsRoutes.get('/:id', asyncHandler(goodsReceiptsController.get))

goodsReceiptsRoutes.post(
  '/',
  authorize('purchases:receive'),
  idempotent(),
  auditAction('GOODS_RECEIPT_CREATE'),
  asyncHandler(goodsReceiptsController.create),
)
