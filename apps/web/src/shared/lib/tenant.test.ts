import { describe, expect, it } from 'vitest'
import { getTenantSlugFromHostname } from './tenant'

describe('getTenantSlugFromHostname', () => {
  it('returns null for the bare root domain', () => {
    expect(getTenantSlugFromHostname('localhost', 'localhost')).toBeNull()
    expect(getTenantSlugFromHostname('agridealer.app', 'agridealer.app')).toBeNull()
  })

  it('returns null for www', () => {
    expect(getTenantSlugFromHostname('www.localhost', 'localhost')).toBeNull()
  })

  it('returns the slug for a valid single-level subdomain', () => {
    expect(getTenantSlugFromHostname('demo-a.localhost', 'localhost')).toBe('demo-a')
    expect(getTenantSlugFromHostname('demo-a.agridealer.app', 'agridealer.app')).toBe('demo-a')
  })

  it('returns null for a multi-level subdomain', () => {
    expect(getTenantSlugFromHostname('a.b.localhost', 'localhost')).toBeNull()
  })

  it('returns null for a hostname that does not match the root domain', () => {
    expect(getTenantSlugFromHostname('demo-a.example.com', 'localhost')).toBeNull()
  })
})
