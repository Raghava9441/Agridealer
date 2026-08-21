import { syncQueue, type SyncTask } from './syncQueue'
import { invoicesApi, type CreateInvoiceInput } from '@/modules/billing/api/invoicesApi'
import { logger } from '@/monitoring/logger'

interface InvoiceCreatePayload {
  input: CreateInvoiceInput
  idempotencyKey: string
}

/**
 * Maps a queued SyncTask back to the API call that actually creates it.
 * Add a case here for each mutation wired into the offline queue —
 * currently just the POS sale (billing/hooks/useCreateInvoice.ts).
 */
async function replay(task: SyncTask): Promise<void> {
  switch (task.type) {
    case 'invoice.create': {
      const { input, idempotencyKey } = task.payload as InvoiceCreatePayload
      await invoicesApi.create(input, idempotencyKey)
      return
    }
    default:
      logger.warn('offline.sync.unknownTaskType', { type: task.type })
  }
}

let draining = false

/**
 * Called on app boot and on the browser's `online` event (see
 * app/providers.tsx). `syncQueue.drain` removes each task only after its
 * handler resolves, so a task that fails to replay (still offline, or a
 * genuine server rejection) is left in place and simply retried on the next
 * reconnect — but everything queued behind it in this pass is skipped too,
 * since `drain` stops at the first throw. `draining` guards against the
 * 'online' listener and the boot call overlapping into two concurrent drains.
 */
export async function drainSyncQueue(): Promise<void> {
  if (draining || !navigator.onLine) return
  draining = true
  try {
    await syncQueue.drain(replay)
  } catch (err) {
    logger.warn('offline.sync.drainFailed', { error: err instanceof Error ? err.message : String(err) })
  } finally {
    draining = false
  }
}
