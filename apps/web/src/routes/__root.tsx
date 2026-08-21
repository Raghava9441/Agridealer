import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { Session } from '@/core/auth/authStrategy'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

export interface RouterContext {
  queryClient: QueryClient
  auth: { ensureSession: () => Promise<Session | null> }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
