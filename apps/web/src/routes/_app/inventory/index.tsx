import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend is built and tested (apps/api/src/modules/inventory):
 * GET /api/v1/inventory/{stock,batches,movements}/:productId and
 * GET /api/v1/inventory/expiring?days=N. modules/inventory/api/inventoryApi.ts
 * and useStockSummary already exist (used by the POS product picker in
 * modules/billing) — this screen just needs a product-level browse UI on
 * top of the same API, following the modules/customers pattern.
 */
export const Route = createFileRoute('/_app/inventory/')({
  component: InventoryPage,
})

function InventoryPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('inventory.title')} description={content.get('inventory.description')}>
      <EmptyState title={content.get('inventory.notBuiltTitle')} description={content.get('inventory.notBuiltDescription')} />
    </PageLayout>
  )
}
