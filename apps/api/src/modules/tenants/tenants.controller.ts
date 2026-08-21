import type { Request, Response } from 'express'
import type { TenantPublic, TenantProfile } from '@agridealer/contracts'
import { updateTenantProfileSchema } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import { sendSuccess } from '../../shared/http/respond'
import { tenantRepository } from './tenants.repository'

/** Pre-login endpoint the frontend uses for branding + "store not found" UX. */
export const tenantsController = {
  async current(req: Request, res: Response) {
    if (!req.subdomainTenant) {
      throw new AppError('TENANT_NOT_FOUND', undefined, 'No tenant for this host')
    }

    const data: TenantPublic = {
      name: req.subdomainTenant.name,
      slug: req.subdomainTenant.slug,
      status: req.subdomainTenant.status,
    }

    sendSuccess(req, res, data)
  },

  async getProfile(req: Request, res: Response) {
    const doc = await tenantRepository.findById(req.tenant.id)
    if (!doc) throw new AppError('NOT_FOUND', { tenantId: req.tenant.id })

    const data: TenantProfile = { address: doc.address, gstin: doc.gstin, phone: doc.phone }
    sendSuccess(req, res, data)
  },

  async updateProfile(req: Request, res: Response) {
    const input = updateTenantProfileSchema.parse(req.body)
    const doc = await tenantRepository.updateProfile(req.tenant.id, input)
    if (!doc) throw new AppError('NOT_FOUND', { tenantId: req.tenant.id })

    const data: TenantProfile = { address: doc.address, gstin: doc.gstin, phone: doc.phone }
    sendSuccess(req, res, data)
  },
}
