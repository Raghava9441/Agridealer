interface StoredEntry {
  value: string
  expiresAt: number | null
}

/**
 * Drop-in stand-in for the Redis client, implementing only the commands
 * this app actually issues (get / set-with-EX / del / ping — see
 * auth.service.ts's refresh-token storage, tenants.cache.ts, and the
 * /health/ready check). Not shared across processes and doesn't persist
 * across restarts; fine for a single local dev instance, wrong the moment
 * there's more than one API replica. See config/redis.ts for how to swap
 * this for a real Redis client.
 */
export class InMemoryStore {
  private readonly store = new Map<string, StoredEntry>()

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  /**
   * `nx: 'NX'` mirrors ioredis's multi-arg `set(key, value, 'EX', seconds, 'NX')` —
   * only claims the key if absent/expired, returning null instead of overwriting
   * (see middleware/idempotency.ts for the atomic-claim use case).
   */
  async set(key: string, value: string, mode: 'EX', seconds: number, nx?: 'NX'): Promise<'OK' | null> {
    if (nx) {
      const existing = this.store.get(key)
      const isLive = existing && (existing.expiresAt === null || existing.expiresAt > Date.now())
      if (isLive) return null
    }
    this.store.set(key, { value, expiresAt: Date.now() + seconds * 1000 })
    return 'OK'
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0
  }

  async ping(): Promise<'PONG'> {
    return 'PONG'
  }

  disconnect(): void {
    this.store.clear()
  }
}
