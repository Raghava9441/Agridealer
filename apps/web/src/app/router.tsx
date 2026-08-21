import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { queryClient } from './queryClient'
import { store } from '@/store'
import { restoreSession } from '@/store/slices/authSlice'
import type { Session } from '@/core/auth/authStrategy'
import { RouteLoadingFallback } from '@/shared/components/ui/RouteLoadingFallback'

/**
 * `beforeLoad` (routes/_app/route.tsx) re-runs this on every navigation
 * within the authenticated shell, not just once — so it must short-circuit
 * once the session is already resolved, same as the Zustand
 * `useSessionStore.ensureSession()` this replaced did. Without this check,
 * every route change re-dispatched `restoreSession()`, which calls
 * `/auth/refresh` again each time and burns through the auth rate limit
 * (10/15min — see apps/api/src/middleware/rateLimit.ts) after a handful of
 * page navigations.
 */
async function ensureSession(): Promise<Session | null> {
  const state = store.getState().auth
  if (state.status === 'authenticated' && state.session) return state.session
  if (state.status === 'anonymous') return null
  return store.dispatch(restoreSession()).unwrap().catch(() => null)
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: { ensureSession },
  },
  defaultPreload: 'intent',
  defaultPendingComponent: RouteLoadingFallback,
  // Route chunks are code-split (autoCodeSplitting in vite.config.ts); avoid
  // flashing the fallback for chunks that resolve near-instantly (cached,
  // or already preloaded by defaultPreload: 'intent').
  defaultPendingMs: 300,
  defaultPendingMinMs: 200,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
