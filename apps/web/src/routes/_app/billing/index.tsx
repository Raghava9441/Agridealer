import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { Tabs } from '@/shared/components/ui/Tabs'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { PosScreen } from '@/modules/billing/components/PosScreen'
import { InvoiceList } from '@/modules/billing/components/InvoiceList'
import { useContent } from '@/cms/useContent'

export const Route = createFileRoute('/_app/billing/')({
  component: BillingPage,
})

function BillingPage() {
  const content = useContent()

  return (
    <ErrorBoundary>
      <PageLayout title={content.get('billing.title')} description={content.get('billing.description')}>
        <Tabs
          items={[
            { value: 'pos', label: content.get('billing.tabs.pos'), content: <PosScreen /> },
            { value: 'history', label: content.get('billing.tabs.history'), content: <InvoiceList /> },
          ]}
        />
      </PageLayout>
    </ErrorBoundary>
  )
}
