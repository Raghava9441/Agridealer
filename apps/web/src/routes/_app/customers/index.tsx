import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { CustomerTable } from '@/modules/customers/components/CustomerTable'
import { CustomerForm } from '@/modules/customers/components/CustomerForm'
import { useContent } from '@/cms/useContent'
import { usePermission } from '@/permissions/hooks'

export const Route = createFileRoute('/_app/customers/')({
  component: CustomersPage,
})

function CustomersPage() {
  const content = useContent()
  const canCreate = usePermission('customers:create')
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <ErrorBoundary>
      <PageLayout
        title={content.get('customers.title')}
        description={content.get('customers.description')}
        actions={
          canCreate && <Button onClick={() => setDialogOpen(true)}>{content.get('customers.addCustomer')}</Button>
        }
      >
        <CustomerTable />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={content.get('customers.addCustomer')}>
          <CustomerForm onSuccess={() => setDialogOpen(false)} />
        </Dialog>
      </PageLayout>
    </ErrorBoundary>
  )
}
