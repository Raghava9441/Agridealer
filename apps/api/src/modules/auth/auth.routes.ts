import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate } from '../../middleware/authenticate'
import { tenantResolver } from '../../middleware/tenantResolver'
import { asyncHandler } from '../../shared/utils/asyncHandler'

/**
 * Mounted at /api/v1/auth, outside the authenticate+tenantResolver pipeline
 * applied to the rest of the API (docs §6.3) — these routes are how a
 * caller obtains identity in the first place.
 */
export const authRoutes = Router()

authRoutes.post('/login', asyncHandler(authController.login))
authRoutes.post('/mfa/verify', asyncHandler(authController.verifyMfa))
authRoutes.post('/refresh', asyncHandler(authController.refresh))
authRoutes.post('/logout', asyncHandler(authController.logout))
authRoutes.get('/me', authenticate, tenantResolver, asyncHandler(authController.me))
