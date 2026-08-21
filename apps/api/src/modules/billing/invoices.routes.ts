import { Router } from 'express'
import { invoicesController } from './invoices.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { idempotent } from '../../middleware/idempotency'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const invoicesRoutes = Router()

invoicesRoutes.get('/', asyncHandler(invoicesController.list))
invoicesRoutes.get('/:id', asyncHandler(invoicesController.get))

invoicesRoutes.post(
  '/',
  authorize('billing:create'),
  idempotent(),
  auditAction('INVOICE_CREATE'),
  asyncHandler(invoicesController.create),
)
