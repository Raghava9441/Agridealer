import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { syncQueue } from './syncQueue'

vi.mock('@/modules/billing/api/invoicesApi', () => ({
  invoicesApi: { create: vi.fn() },
}))

const { invoicesApi } = await import('@/modules/billing/api/invoicesApi')
const { drainSyncQueue } = await import('./offlineSync')

describe('drainSyncQueue', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    // IndexedDbStore never closes the connections it opens, so
    // indexedDB.deleteDatabase() would block on a prior test's still-open
    // handle — draining through the store's own API sidesteps that (no
    // version-change transaction involved) and leaves each test with an
    // empty queue.
    await syncQueue.drain(async () => {})
  })

  it('replays a queued invoice.create task and removes it once it succeeds', async () => {
    const input = { lines: [] }
    await syncQueue.enqueue({ type: 'invoice.create', payload: { input, idempotencyKey: 'key-1' } })
    expect(await syncQueue.size()).toBe(1)

    vi.mocked(invoicesApi.create).mockResolvedValue({ _id: 'inv-1' } as never)
    await drainSyncQueue()

    expect(invoicesApi.create).toHaveBeenCalledWith(input, 'key-1')
    expect(await syncQueue.size()).toBe(0)
  })

  it('leaves the task queued while offline, and never calls the API', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    await syncQueue.enqueue({ type: 'invoice.create', payload: { input: {}, idempotencyKey: 'key-2' } })

    await drainSyncQueue()

    expect(invoicesApi.create).not.toHaveBeenCalled()
    expect(await syncQueue.size()).toBe(1)
  })

  it('stops at a task that fails to replay, leaving it (and anything queued behind it) in place', async () => {
    await syncQueue.enqueue({ type: 'invoice.create', payload: { input: {}, idempotencyKey: 'key-3' } })
    await syncQueue.enqueue({ type: 'invoice.create', payload: { input: {}, idempotencyKey: 'key-4' } })
    vi.mocked(invoicesApi.create).mockRejectedValueOnce(new Error('still offline'))

    await drainSyncQueue()

    expect(invoicesApi.create).toHaveBeenCalledTimes(1)
    expect(await syncQueue.size()).toBe(2)
  })
})
