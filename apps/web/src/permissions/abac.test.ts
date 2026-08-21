import { describe, expect, it } from 'vitest'
import { evaluateAbac, isResourceOwner, requiresFeatureFlag, requiresPlan, type AbacContext, type AbacPolicy } from './abac'

const baseContext: AbacContext = {
  role: 'owner',
  tenantPlan: 'starter',
  featureFlags: [],
}

describe('evaluateAbac', () => {
  it('allows an action with no registered policy (RBAC-only, unconstrained)', () => {
    expect(evaluateAbac([], 'invoice:cancel', baseContext)).toBe(true)
  })

  it('requires every rule in a policy to pass (AND)', () => {
    const policies: AbacPolicy[] = [
      { action: 'reports:export', rules: [requiresPlan('pro', 'enterprise'), requiresFeatureFlag('exports')] },
    ]

    expect(evaluateAbac(policies, 'reports:export', { ...baseContext, tenantPlan: 'starter' })).toBe(false)
    expect(
      evaluateAbac(policies, 'reports:export', { ...baseContext, tenantPlan: 'pro', featureFlags: [] }),
    ).toBe(false)
    expect(
      evaluateAbac(policies, 'reports:export', { ...baseContext, tenantPlan: 'pro', featureFlags: ['exports'] }),
    ).toBe(true)
  })

  it('evaluates isResourceOwner against the context resource/user', () => {
    const policies: AbacPolicy[] = [{ action: 'invoice:cancel', rules: [isResourceOwner()] }]
    const owned = { ...baseContext, userId: 'user-1', resourceOwnerId: 'user-1' }
    const notOwned = { ...baseContext, userId: 'user-1', resourceOwnerId: 'user-2' }

    expect(evaluateAbac(policies, 'invoice:cancel', owned)).toBe(true)
    expect(evaluateAbac(policies, 'invoice:cancel', notOwned)).toBe(false)
  })

  it('only applies rules for the matching action, leaving others unconstrained', () => {
    const policies: AbacPolicy[] = [{ action: 'reports:export', rules: [requiresPlan('pro')] }]
    expect(evaluateAbac(policies, 'customers:create', baseContext)).toBe(true)
  })
})
