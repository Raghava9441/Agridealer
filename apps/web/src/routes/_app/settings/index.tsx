import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requirePermission } from '@/shared/lib/requirePermission'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { TenantProfileForm } from '@/modules/tenant/components/TenantProfileForm'
import { UserTable } from '@/modules/users/components/UserTable'
import { CreateUserForm } from '@/modules/users/components/CreateUserForm'
import { useContent } from '@/cms/useContent'

export const Route = createFileRoute('/_app/settings/')({
  beforeLoad: ({ context }) => {
    requirePermission(context.session, 'users:manage')
  },
  component: SettingsPage,
})

function SettingsPage() {
  const content = useContent()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <PageLayout title={content.get('settings.title')} description={content.get('settings.description')}>
      <div className="max-w-md">
        <h2 className="mb-3 text-base font-semibold">{content.get('settings.profile.title')}</h2>
        <TenantProfileForm />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{content.get('settings.users.title')}</h2>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            {content.get('settings.users.addStaff')}
          </Button>
        </div>
        <UserTable />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={content.get('settings.users.addStaff')}>
          <CreateUserForm onSuccess={() => setDialogOpen(false)} />
        </Dialog>
      </div>
    </PageLayout>
  )
}
