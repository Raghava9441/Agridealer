import { Tenant, type ITenant } from './tenants.model'

/**
 * Tenants are the one collection with no tenantId scoping — a tenant
 * document is its own root, not a child of another tenant.
 */
export class TenantRepository {
  findById(id: string) {
    return Tenant.findById(id)
  }

  findBySlug(slug: string) {
    return Tenant.findOne({ slug })
  }

  create(input: Partial<ITenant>) {
    return Tenant.create(input)
  }

  updateProfile(tenantId: string, patch: Partial<Pick<ITenant, 'address' | 'gstin' | 'phone'>>) {
    return Tenant.findByIdAndUpdate(tenantId, patch, { new: true })
  }
}

export const tenantRepository = new TenantRepository()
