import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/shared/lib/requirePermission'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * No reports/aggregation endpoint exists yet. The data to compute a real
 * profit report is there (StockMovement.unitCostPaise = COGS vs.
 * Invoice.lines[].unitPricePaise = revenue, see dbstructure.md), but
 * nothing aggregates it server-side — DashboardRenderer/ChartWidget
 * (shared/components/dynamic, widgets/) are ready to render it the moment
 * that endpoint exists.
 */
export const Route = createFileRoute('/_app/reports/')({
  beforeLoad: ({ context }) => {
    requirePermission(context.session, 'reports:view')
  },
  component: ReportsPage,
})

function ReportsPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('reports.title')} description={content.get('reports.description')}>
      <EmptyState title={content.get('reports.notBuiltTitle')} description={content.get('reports.notBuiltDescription')} />
    </PageLayout>
  )
}
