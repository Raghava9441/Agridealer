import type { ClientSession } from 'mongoose'
import { Counter } from './counter.model'

/**
 * Atomically returns the next integer in a per-tenant, per-name sequence.
 * Callers format the business-visible number (e.g. `INV-000123`) themselves —
 * this only guarantees the integer is never handed out twice, including
 * under concurrent requests, via a single $inc upsert rather than
 * read-then-write.
 */
export async function nextSequence(tenantId: string, name: string, session?: ClientSession): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { tenantId, name },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session },
  )
  return counter.seq
}

export function formatSequence(prefix: string, seq: number, width = 6): string {
  return `${prefix}-${String(seq).padStart(width, '0')}`
}
