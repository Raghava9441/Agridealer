import { Router } from 'express'
import { vendorsController } from './vendors.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const vendorsRoutes = Router()

// No dedicated vendors:* permission — vendor master data is part of the
// purchases domain, gated by purchases:manage (owner/manager only; warehouse
// has purchases:receive but not purchases:manage, so it can receive against
// an existing vendor but not create/edit one).
vendorsRoutes.get('/', asyncHandler(vendorsController.list))
vendorsRoutes.get('/:id', asyncHandler(vendorsController.get))

vendorsRoutes.post(
  '/',
  authorize('purchases:manage'),
  auditAction('VENDOR_CREATE'),
  asyncHandler(vendorsController.create),
)

vendorsRoutes.patch(
  '/:id',
  authorize('purchases:manage'),
  auditAction('VENDOR_UPDATE'),
  asyncHandler(vendorsController.update),
)
