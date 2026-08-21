import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend model exists (apps/api/src/modules/cashbook/cashbookDay.model.ts)
 * but has no service/controller/routes yet. Its reconciliation math
 * depends on Expense also having a real API (see routes/_app/expenses) —
 * build that first.
 */
export const Route = createFileRoute('/_app/cashbook/')({
  component: CashbookPage,
})

function CashbookPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('cashbook.title')} description={content.get('cashbook.description')}>
      <EmptyState title={content.get('cashbook.notBuiltTitle')} description={content.get('cashbook.notBuiltDescription')} />
    </PageLayout>
  )
}
