import type { Permission } from '@agridealer/contracts'

/**
 * Field name → the Permission required to see/edit it. Empty today — the
 * backend doesn't restrict any field within a resource the caller is
 * already authorized to read (e.g. every role that can view a Customer
 * gets the full document, including `currentBalancePaise`), so inventing a
 * frontend-only field restriction wouldn't match reality. Real example, the
 * moment one exists:
 *
 *   'customer.currentBalancePaise': 'reports:profit'
 */
export const FIELD_PERMISSIONS: Record<string, Permission> = {}
