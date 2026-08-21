import { Router } from 'express'
import { paymentsController } from './payments.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { idempotent } from '../../middleware/idempotency'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const paymentsRoutes = Router()

paymentsRoutes.get('/', asyncHandler(paymentsController.list))
paymentsRoutes.get('/:id', asyncHandler(paymentsController.get))

paymentsRoutes.post(
  '/',
  authorize('payments:record'),
  idempotent(),
  auditAction('PAYMENT_RECORD'),
  asyncHandler(paymentsController.create),
)
