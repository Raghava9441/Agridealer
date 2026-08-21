import type { TenantPublic, TenantProfile, UpdateTenantProfileInput } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'

export const tenantKeys = {
  current: ['tenant', 'current'] as const,
  profile: ['tenant', 'profile'] as const,
}

/** Talks to apps/api/src/modules/tenants/tenants.routes.ts. */
export const tenantApi = {
  /** Public, resolved from the subdomain. */
  current(): Promise<TenantPublic> {
    return apiRequest<TenantPublic>('/tenants/current')
  },
  /** Authenticated, users:manage only — dealer business-profile fields (Settings). */
  getProfile(): Promise<TenantProfile> {
    return apiRequest<TenantProfile>('/tenants/profile')
  },
  updateProfile(input: UpdateTenantProfileInput): Promise<TenantProfile> {
    return apiRequest<TenantProfile>('/tenants/profile', { method: 'PATCH', body: JSON.stringify(input) })
  },
}
