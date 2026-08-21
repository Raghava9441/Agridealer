import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ApiError } from '@/core/http/apiClient'
import { useCurrentTenant } from '@/modules/tenant/hooks/useCurrentTenant'

/** Pathless layout for the unauthenticated shell (docs §5.2.1). */
export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const { data: tenant, error, isLoading } = useCurrentTenant()

  if (!isLoading && error instanceof ApiError && error.code === 'TENANT_NOT_FOUND') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="w-full max-w-sm rounded-lg bg-surface p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Store not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There's no dealer registered at this address. Check the link and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-sm">
        {tenant && <p className="mb-4 text-center text-sm font-medium text-muted-foreground">{tenant.name}</p>}
        <Outlet />
      </div>
    </div>
  )
}
