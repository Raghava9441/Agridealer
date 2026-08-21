import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/shared/lib/requirePermission'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { TenantProfileForm } from '@/modules/tenant/components/TenantProfileForm'
import { useContent } from '@/cms/useContent'

/**
 * Backend supports POST /api/v1/users (create a staff member, not yet
 * surfaced here — no list/edit/deactivate endpoint exists) and
 * GET/PATCH /api/v1/tenants/profile (the dealer business profile below,
 * used for the printable bill's letterhead).
 */
export const Route = createFileRoute('/_app/settings/')({
  beforeLoad: ({ context }) => {
    requirePermission(context.session, 'users:manage')
  },
  component: SettingsPage,
})

function SettingsPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('settings.title')} description={content.get('settings.description')}>
      <div className="max-w-md">
        <h2 className="mb-3 text-base font-semibold">{content.get('settings.profile.title')}</h2>
        <TenantProfileForm />
      </div>
    </PageLayout>
  )
}
