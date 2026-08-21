import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend is built and tested (apps/api/src/modules/products,
 * apps/api/src/modules/inventory): GET/POST/PATCH /api/v1/products,
 * GET /api/v1/inventory/{stock,batches,movements}/:productId. Follow the
 * modules/customers pattern (DynamicTable + DynamicForm + Dialog) to wire
 * this screen — deliberately not built in this pass, see the frontend
 * scaffold plan's "two example modules" scope note.
 */
export const Route = createFileRoute('/_app/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('products.title')} description={content.get('products.description')}>
      <EmptyState title={content.get('products.notBuiltTitle')} description={content.get('products.notBuiltDescription')} />
    </PageLayout>
  )
}
