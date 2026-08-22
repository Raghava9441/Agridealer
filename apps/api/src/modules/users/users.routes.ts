import { Router } from 'express'
import { usersController } from './users.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const usersRoutes = Router()

// Every route here is users:manage-only — per the role matrix (roles.ts)
// that's owner alone, not manager. Staff administration is deliberately
// narrower than the rest of manager's otherwise-broad permission set.
usersRoutes.get('/', authorize('users:manage'), asyncHandler(usersController.list))

usersRoutes.post(
  '/',
  authorize('users:manage'),
  auditAction('USER_CREATE'),
  asyncHandler(usersController.create),
)

usersRoutes.patch(
  '/:id',
  authorize('users:manage'),
  auditAction('USER_UPDATE'),
  asyncHandler(usersController.update),
)
