import { Router } from 'express'
import { customersController } from './customers.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const customersRoutes = Router()

// No dedicated customers:view permission — every authenticated role needs to
// look up a customer (e.g. sales attaching one to an invoice), so reads are
// gated by authenticate + tenantResolver only (applied where this mounts).
customersRoutes.get('/', asyncHandler(customersController.list))
customersRoutes.get('/:id', asyncHandler(customersController.get))

customersRoutes.post(
  '/',
  authorize('customers:create'),
  auditAction('CUSTOMER_CREATE'),
  asyncHandler(customersController.create),
)

customersRoutes.patch(
  '/:id',
  authorize('customers:edit'),
  auditAction('CUSTOMER_UPDATE'),
  asyncHandler(customersController.update),
)
