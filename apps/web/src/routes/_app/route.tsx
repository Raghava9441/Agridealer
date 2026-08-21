import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { store, useAppSelector } from '@/store'
import { logout, selectSession } from '@/store/slices/authSlice'
import { AppShell } from '@/shared/components/layout/AppShell'
import { appConfig } from '@/bootstrap/config'
import { getTenantSlugFromHostname } from '@/shared/lib/tenant'

/**
 * Authenticated shell (docs §5.2.2): asserts a session before any child
 * route loader runs, and preserves the deep link so it survives the
 * login round trip.
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.auth.ensureSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    // A session's tenant can legitimately outlive a navigation to a
    // different tenant's subdomain (e.g. a bookmark, or switching browser
    // tabs) — the JWT would still be valid but for the wrong store, so
    // treat it the same as no session rather than leaking the wrong tenant's
    // shell. The API enforces this too (tenantResolver's TENANT_MISMATCH),
    // this just avoids waiting on a failed API call to find out.
    const hostSlug = getTenantSlugFromHostname(window.location.hostname, appConfig.rootDomain)
    if (hostSlug && session.tenant.slug !== hostSlug) {
      await store.dispatch(logout())
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const session = useAppSelector(selectSession)
  return (
    <AppShell session={session}>
      <Outlet />
    </AppShell>
  )
}
