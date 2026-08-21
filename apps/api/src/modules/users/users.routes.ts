import { Router } from 'express'
import { usersController } from './users.controller'
import { authorize } from '../../middleware/authorize'
import { auditAction } from '../../middleware/auditAction'
import { asyncHandler } from '../../shared/utils/asyncHandler'

export const usersRoutes = Router()

usersRoutes.post(
  '/',
  authorize('users:manage'),
  auditAction('USER_CREATE'),
  asyncHandler(usersController.create),
)
