import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../shared/errors/AppError'
import { tenantCache, type CachedTenant } from '../modules/tenants/tenants.cache'
import { tenantRepository } from '../modules/tenants/tenants.repository'
import { requestContextStorage } from './requestContext'

declare module 'express-serve-static-core' {
  interface Request {
    tenant: CachedTenant
  }
}

/**
 * Loads the tenant (and its plan) for the tenantId carried in the verified
 * JWT claim, Redis-first with a MongoDB fallback (docs §3.4, §6.4). A
 * suspended tenant is rejected before any handler executes.
 */
export const tenantResolver: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { tenantId } = req.user

  try {
    let tenant = await tenantCache.get(tenantId)

    if (!tenant) {
      const doc = await tenantRepository.findById(tenantId)
      if (!doc) return next(new AppError('NOT_FOUND', { tenantId }, 'Tenant not found'))

      tenant = { id: doc.id, slug: doc.slug, name: doc.name, status: doc.status, plan: doc.plan, features: doc.features }
      await tenantCache.set(tenant)
    }

    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return next(new AppError('TENANT_SUSPENDED', { tenantId }))
    }

    // A still-valid JWT for one tenant must not be usable against another
    // tenant's subdomain (the refresh cookie isn't tenant-scoped by the
    // browser when the API is served from a single fixed host).
    if (req.subdomainTenant && req.subdomainTenant.id !== tenant.id) {
      return next(new AppError('TENANT_MISMATCH', { tokenTenantId: tenant.id, hostTenantId: req.subdomainTenant.id }))
    }

    req.tenant = tenant

    const store = requestContextStorage.getStore()
    if (store) {
      store.tenantId = tenant.id
      store.userId = req.user.userId
      store.role = req.user.role
    }

    next()
  } catch (err) {
    next(err)
  }
}
