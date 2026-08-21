import type { Permission } from '@agridealer/contracts'
import { useAppSelector } from '@/store'
import { selectHasPermission } from '@/store/slices/permissionsSlice'
import { selectRole } from '@/store/slices/authSlice'
import { selectTenant } from '@/store/slices/tenantSlice'
import { evaluateAbac, type AbacContext } from './abac'
import { POLICIES } from './policies'
import { FIELD_PERMISSIONS } from './fieldPermissions'

/** RBAC only — does this role have this permission at all. Backed by the same matrix apps/api's authorize() middleware enforces. */
export function usePermission(permission: Permission): boolean {
  return useAppSelector(selectHasPermission(permission))
}

/**
 * RBAC + ABAC combined — "can the current user do `action` to this
 * specific resource." `permission` is the RBAC gate (omit if the action has
 * none); `resourceOwnerId` feeds resource-scoped ABAC rules like
 * `isResourceOwner()`.
 */
export function useCan(action: string, options: { permission?: Permission; resourceOwnerId?: string } = {}): boolean {
  const role = useAppSelector(selectRole)
  const tenant = useAppSelector(selectTenant)
  const granted = useAppSelector((state) => (options.permission ? selectHasPermission(options.permission)(state) : true))

  if (!role || !granted) return false

  const context: AbacContext = {
    role,
    tenantPlan: tenant.plan,
    featureFlags: tenant.features,
    resourceOwnerId: options.resourceOwnerId,
  }
  return evaluateAbac(POLICIES, action, context)
}

/** Button-level gating is just `usePermission`/`useCan` used directly on a <Button disabled={!can}> — no separate hook needed. */

/** Should this form/table field be visible to the current role. Config-driven (fieldPermissions.ts), not scattered inline checks. */
export function useFieldPermission(field: string): boolean {
  const required = FIELD_PERMISSIONS[field]
  const granted = useAppSelector((state) => (required ? selectHasPermission(required)(state) : true))
  return !required || granted
}
