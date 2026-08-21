import { redis } from '../../config/redis'
import type { ITenant } from './tenants.model'

const TTL_SECONDS = 300

export interface CachedTenant {
  id: string
  slug: string
  name: string
  status: ITenant['status']
  plan: string
  features: string[]
}

const key = (tenantId: string) => `tenant:${tenantId}`
const slugKey = (slug: string) => `tenant:slug:${slug}`

export const tenantCache = {
  async get(tenantId: string): Promise<CachedTenant | null> {
    const raw = await redis.get(key(tenantId))
    return raw ? (JSON.parse(raw) as CachedTenant) : null
  },

  async getBySlug(slug: string): Promise<CachedTenant | null> {
    const raw = await redis.get(slugKey(slug))
    return raw ? (JSON.parse(raw) as CachedTenant) : null
  },

  async set(tenant: CachedTenant): Promise<void> {
    const serialized = JSON.stringify(tenant)
    await redis.set(key(tenant.id), serialized, 'EX', TTL_SECONDS)
    await redis.set(slugKey(tenant.slug), serialized, 'EX', TTL_SECONDS)
  },

  async invalidate(tenantId: string, slug?: string): Promise<void> {
    await redis.del(key(tenantId))
    if (slug) await redis.del(slugKey(slug))
  },
}
