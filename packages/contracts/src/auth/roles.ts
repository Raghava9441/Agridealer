/**
 * Roles and permission matrix from the BRD (docs §11.2). Generated into a
 * single shared constant so the frontend nav/UI checks and the backend
 * `authorize()` middleware cannot drift. The frontend check is a usability
 * affordance only — the backend is the enforcement point (docs §5.2.2, §11.2).
 */
export const ROLES = ['owner', 'manager', 'sales', 'accountant', 'warehouse'] as const
export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'billing:create',
  'billing:cancel',
  'billing:editPrice',
  'customers:create',
  'customers:edit',
  'reports:profit',
  'reports:view',
  'products:create',
  'products:edit',
  'inventory:receive',
  'inventory:adjust',
  'purchases:manage',
  'purchases:receive',
  'payments:record',
  'expenses:manage',
  'expenses:view',
  'cashbook:close',
  'messaging:broadcast',
  'users:manage',
  'audit:view',
] as const
export type Permission = (typeof PERMISSIONS)[number]

/** Role -> permission set, encoding the matrix in docs §11.2. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [...PERMISSIONS],
  manager: [
    'billing:create',
    'billing:cancel',
    'billing:editPrice',
    'customers:create',
    'customers:edit',
    'reports:profit',
    'reports:view',
    'products:create',
    'products:edit',
    'inventory:receive',
    'inventory:adjust',
    'purchases:manage',
    'purchases:receive',
    'payments:record',
    'expenses:view',
    'messaging:broadcast',
  ],
  sales: ['billing:create', 'customers:create', 'reports:view'],
  accountant: ['reports:profit', 'reports:view', 'payments:record', 'expenses:manage', 'cashbook:close'],
  warehouse: ['reports:view', 'inventory:receive', 'inventory:adjust', 'purchases:receive'],
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
