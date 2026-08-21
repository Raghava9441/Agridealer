import { EventEmitter } from 'node:events'

/**
 * Domain event dispatcher (docs §6.7). Services emit events after a
 * successful commit; listeners translate them into BullMQ jobs. This
 * keeps modules decoupled — e.g. the billing service does not know
 * WhatsApp delivery exists, it just emits 'invoice.created'.
 *
 * Not yet wired to any queue consumers — jobs/workers land alongside the
 * first module (billing) that actually needs asynchronous side effects.
 */
class EventBus extends EventEmitter {}

export const events = new EventBus()
