import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend model exists (apps/api/src/modules/expenses/expense.model.ts) but
 * has no service/controller/routes yet — nothing to call from here until
 * that's built (same CRUD shape as customers/products would apply).
 */
export const Route = createFileRoute('/_app/expenses/')({
  component: ExpensesPage,
})

function ExpensesPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('expenses.title')} description={content.get('expenses.description')}>
      <EmptyState title={content.get('expenses.notBuiltTitle')} description={content.get('expenses.notBuiltDescription')} />
    </PageLayout>
  )
}
