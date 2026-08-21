import { useEffect, useState } from 'react'
import { syncQueue } from './syncQueue'

const POLL_MS = 5000

/**
 * syncQueue has no pub/sub of its own (IndexedDB doesn't give us one for
 * free) — polling is the simplest thing that's actually correct here, and at
 * a 5s interval for what's meant to be a low-key header badge, not a big
 * enough cost to justify building a real event source yet.
 */
export function useSyncQueueSize(): number {
  const [size, setSize] = useState(0)

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      void syncQueue.size().then((n) => {
        if (!cancelled) setSize(n)
      })
    }
    refresh()
    const interval = setInterval(refresh, POLL_MS)
    window.addEventListener('online', refresh)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('online', refresh)
    }
  }, [])

  return size
}
