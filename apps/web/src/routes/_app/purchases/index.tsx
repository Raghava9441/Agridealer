import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend is built and tested (apps/api/src/modules/purchases): vendors,
 * purchase-orders, and goods-receipts routes all exist and were verified
 * end-to-end this session (a GRN atomically creates/tops-up ProductBatch +
 * StockMovement + advances PurchaseOrder status). VendorBill/vendor
 * payments are the one piece of that module not built yet. Wire this
 * screen following the modules/customers pattern.
 */
export const Route = createFileRoute('/_app/purchases/')({
  component: PurchasesPage,
})

function PurchasesPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('purchases.title')} description={content.get('purchases.description')}>
      <EmptyState title={content.get('purchases.notBuiltTitle')} description={content.get('purchases.notBuiltDescription')} />
    </PageLayout>
  )
}
