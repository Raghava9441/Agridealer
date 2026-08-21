import type { Permission } from '@agridealer/contracts'

export interface NavItem {
  to: string
  labelKey: string
  /** Omit when every authenticated role can see the item — true for most list/read screens today, since only mutating endpoints are RBAC-gated (see apps/api's route files). */
  permission?: Permission
  featureFlag?: string
}

/**
 * The menu is data, filtered live by permissions/featureFlags — not a
 * hardcoded per-role menu tree. Most items have no `permission` because
 * that's honestly what the backend enforces: every `GET` route in
 * apps/api only requires authentication, not a specific permission (see
 * e.g. customers.routes.ts) — only `Settings` reflects a real restriction
 * (`users:manage`, which only `owner` holds).
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/billing', labelKey: 'nav.billing' },
  { to: '/customers', labelKey: 'nav.customers' },
  { to: '/products', labelKey: 'nav.products' },
  { to: '/inventory', labelKey: 'nav.inventory' },
  { to: '/purchases', labelKey: 'nav.purchases' },
  { to: '/credit', labelKey: 'nav.credit' },
  { to: '/expenses', labelKey: 'nav.expenses' },
  { to: '/cashbook', labelKey: 'nav.cashbook' },
  { to: '/reports', labelKey: 'nav.reports' },
  { to: '/settings', labelKey: 'nav.settings', permission: 'users:manage' },
]
