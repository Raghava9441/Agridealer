import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../shared/errors/AppError'
import { env } from '../config/env'
import { tenantCache, type CachedTenant } from '../modules/tenants/tenants.cache'
import { tenantRepository } from '../modules/tenants/tenants.repository'

declare module 'express-serve-static-core' {
  interface Request {
    /** Tenant resolved from the request's Host header, or null on the bare root domain. */
    subdomainTenant: CachedTenant | null
  }
}

/**
 * Parses a single-level subdomain label off `hostname` (e.g. "demo-a" from
 * "demo-a.agridealer.app"). Bare root domain, "www", or a multi-level
 * subdomain all resolve to no tenant — this app intentionally supports one
 * subdomain level per tenant, not arbitrary nesting.
 */
export function extractSlug(hostname: string, rootDomain: string): string | null {
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) return null
  const suffix = `.${rootDomain}`
  if (!hostname.endsWith(suffix)) return null
  const label = hostname.slice(0, -suffix.length)
  if (!label || label.includes('.')) return null
  return label
}

/**
 * Resolves the tenant implied by the request's hostname before any auth
 * happens (docs §subdomain tenancy). Runs globally, ahead of both the
 * public auth routes and the protected pipeline, so login/refresh/MFA can
 * scope themselves to a tenant instead of guessing from a bare email.
 */
export const subdomainResolver: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const slug = extractSlug(req.hostname, env.ROOT_DOMAIN)

  if (!slug) {
    req.subdomainTenant = null
    return next()
  }

  try {
    let tenant = await tenantCache.getBySlug(slug)

    if (!tenant) {
      const doc = await tenantRepository.findBySlug(slug)
      if (!doc) return next(new AppError('TENANT_NOT_FOUND', { slug }))

      tenant = { id: doc.id, slug: doc.slug, name: doc.name, status: doc.status, plan: doc.plan, features: doc.features }
      await tenantCache.set(tenant)
    }

    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return next(new AppError('TENANT_SUSPENDED', { slug }))
    }

    req.subdomainTenant = tenant
    next()
  } catch (err) {
    next(err)
  }
}
