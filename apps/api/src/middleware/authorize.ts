import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { roleHasPermission, type Permission } from '@agridealer/contracts'
import { AppError } from '../shared/errors/AppError'

/**
 * RBAC permission check (docs §11.2). Runs after authenticate + tenantResolver
 * so req.user.role is available. The frontend hides controls the user can't
 * use as a usability affordance only — this is the actual enforcement point.
 */
export function authorize(permission: Permission): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roleHasPermission(req.user.role, permission)) {
      return next(new AppError('FORBIDDEN', { permission, role: req.user.role }))
    }
    next()
  }
}
