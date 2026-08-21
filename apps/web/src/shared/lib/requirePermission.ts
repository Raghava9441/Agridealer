import { redirect } from '@tanstack/react-router'
import { roleHasPermission, type Permission } from '@agridealer/contracts'
import type { Session } from '@/core/auth/authStrategy'

/**
 * Route-level permission gate (docs §5.2.2), used in route `beforeLoad`
 * hooks where hooks (`usePermission` in permissions/hooks.ts) aren't
 * available. This is a usability affordance only — the backend
 * `authorize()` middleware is the actual enforcement point. Both read from
 * the same @agridealer/contracts permission map so they cannot drift.
 */
export function requirePermission(session: Session | undefined | null, permission: Permission): void {
  if (!session || !roleHasPermission(session.role, permission)) {
    throw redirect({ to: '/dashboard' })
  }
}
