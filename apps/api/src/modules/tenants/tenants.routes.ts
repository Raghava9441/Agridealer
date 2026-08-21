import { Router } from 'express'
import { tenantsController } from './tenants.controller'
import { authenticate } from '../../middleware/authenticate'
import { tenantResolver } from '../../middleware/tenantResolver'
import { authorize } from '../../middleware/authorize'
import { asyncHandler } from '../../shared/utils/asyncHandler'

/**
 * Mounted at /api/v1/tenants, outside the global authenticate+tenantResolver
 * pipeline (that pipeline only wraps the /api/v1 apiRoutes block in app.ts) —
 * /current must work pre-login. /profile is authenticated per-route instead,
 * same mixed-router shape auth.routes.ts already uses for /me.
 */
export const tenantsRoutes = Router()

tenantsRoutes.get('/current', asyncHandler(tenantsController.current))

tenantsRoutes.get('/profile', authenticate, tenantResolver, authorize('users:manage'), asyncHandler(tenantsController.getProfile))
tenantsRoutes.patch('/profile', authenticate, tenantResolver, authorize('users:manage'), asyncHandler(tenantsController.updateProfile))
