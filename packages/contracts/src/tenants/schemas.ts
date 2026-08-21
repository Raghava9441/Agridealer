import { z } from 'zod'
import { addressSchema } from '../customers/schemas'

/** DNS-label-safe slug used for subdomain tenant resolution (shopname.agridealer.app). */
export const TENANT_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export const tenantSlugSchema = z.string().regex(TENANT_SLUG_PATTERN, 'Invalid tenant slug')

/** Response shape for GET /tenants/current — resolved from the request's subdomain, pre-login. */
export const tenantPublicSchema = z.object({
  name: z.string(),
  slug: tenantSlugSchema,
  status: z.enum(['active', 'suspended', 'trial']),
})
export type TenantPublic = z.infer<typeof tenantPublicSchema>

/** Dealer business-profile fields shown on the printable bill letterhead (docs Settings). */
export const updateTenantProfileSchema = z.object({
  address: addressSchema.optional(),
  gstin: z.string().optional(),
  phone: z.string().optional(),
})
export type UpdateTenantProfileInput = z.infer<typeof updateTenantProfileSchema>

export const tenantProfileSchema = updateTenantProfileSchema
export type TenantProfile = z.infer<typeof tenantProfileSchema>
