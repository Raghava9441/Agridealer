/** Shared by every tenant-scoped repository (docs §6.5) — see users.repository.ts for the original pattern this follows. */
export interface TenantContext {
  tenantId: string
}
