import { IndexedDbStore } from './indexedDbStore'

export interface SyncTask {
  id: string
  type: string
  payload: unknown
  createdAt: number
}

/**
 * Queues a mutation made while offline for later replay. Real and
 * functional (backed by IndexedDB, survives a reload), but nothing enqueues
 * to it yet — no mutation in the app currently detects offline and defers
 * itself, so there's no conflict-resolution UI either (there's nothing to
 * conflict). The seam is here for whichever mutation needs it first.
 */
export interface SyncQueue {
  enqueue(task: Omit<SyncTask, 'id' | 'createdAt'>): Promise<void>
  /** Runs `handler` for each queued task oldest-first, removing it once `handler` resolves without throwing. */
  drain(handler: (task: SyncTask) => Promise<void>): Promise<void>
  size(): Promise<number>
}

class IndexedDbSyncQueue implements SyncQueue {
  private readonly store = new IndexedDbStore('agridealer-offline', 'sync-queue')

  async enqueue(task: Omit<SyncTask, 'id' | 'createdAt'>): Promise<void> {
    const id = crypto.randomUUID()
    await this.store.set(id, { ...task, id, createdAt: Date.now() } satisfies SyncTask)
  }

  async drain(handler: (task: SyncTask) => Promise<void>): Promise<void> {
    const tasks = (await this.store.getAll<SyncTask>()).sort((a, b) => a.createdAt - b.createdAt)
    for (const task of tasks) {
      await handler(task)
      await this.store.delete(task.id)
    }
  }

  async size(): Promise<number> {
    return (await this.store.getAll()).length
  }
}

export const syncQueue: SyncQueue = new IndexedDbSyncQueue()
