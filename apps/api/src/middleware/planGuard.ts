import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../shared/errors/AppError'

/**
 * Subscription feature entitlement gate (docs §2.5, §3.2). Feature
 * availability is resolved per tenant from the plan document cached by
 * tenantResolver, so tiered pricing never requires code branching.
 */
export function planGuard(feature: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.tenant.features.includes(feature)) {
      return next(new AppError('FEATURE_NOT_IN_PLAN', { feature, plan: req.tenant.plan }))
    }
    next()
  }
}
