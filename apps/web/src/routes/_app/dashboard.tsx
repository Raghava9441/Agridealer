import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * No dashboard-aggregation endpoint exists yet (the original "daily_aggregates
 * snapshot" this route was waiting on). DashboardRenderer + WidgetRenderer
 * (shared/components/dynamic/) + KpiCard/ChartWidget (widgets/) are built
 * and ready — this screen becomes `<DashboardRenderer widgets={...} />` the
 * moment a real aggregation endpoint exists to feed it.
 */
export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('dashboard.title')} description={content.get('dashboard.description')}>
      <EmptyState title={content.get('dashboard.notBuiltTitle')} description={content.get('dashboard.notBuiltDescription')} />
    </PageLayout>
  )
}
