import type { Role } from '@agridealer/contracts'

export interface AbacContext {
  role: Role
  tenantPlan: string | null
  featureFlags: string[]
  userId?: string
  /** The resource being acted on, when the action is resource-scoped (e.g. "edit this customer"). */
  resourceOwnerId?: string
}

export type AbacRule = (context: AbacContext) => boolean

export interface AbacPolicy {
  action: string
  /** All rules must pass (AND). An action with no registered policy is ABAC-unconstrained — RBAC alone decides it. */
  rules: AbacRule[]
}

export function evaluateAbac(policies: AbacPolicy[], action: string, context: AbacContext): boolean {
  const policy = policies.find((p) => p.action === action)
  if (!policy) return true
  return policy.rules.every((rule) => rule(context))
}

// --- reusable rule builders -------------------------------------------------

export function requiresFeatureFlag(flag: string): AbacRule {
  return (context) => context.featureFlags.includes(flag)
}

export function requiresPlan(...plans: string[]): AbacRule {
  return (context) => context.tenantPlan !== null && plans.includes(context.tenantPlan)
}

/** True only when the current user is the owner of the resource being acted on. */
export function isResourceOwner(): AbacRule {
  return (context) => !!context.userId && context.userId === context.resourceOwnerId
}
