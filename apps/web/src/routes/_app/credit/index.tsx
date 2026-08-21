import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useContent } from '@/cms/useContent'

/**
 * Backend is built and tested (apps/api/src/modules/credit): POST/GET
 * /api/v1/payments records a customer receipt against one or more
 * invoices and updates Customer.currentBalancePaise + CreditLedgerEntry
 * atomically (see invoices.service.ts's debit half + payments.service.ts's
 * credit half). Ledger/ageing views (per this route's original phase note)
 * aren't built — no ageing-bucket rule exists yet (see dbstructure.md).
 */
export const Route = createFileRoute('/_app/credit/')({
  component: CreditPage,
})

function CreditPage() {
  const content = useContent()
  return (
    <PageLayout title={content.get('credit.title')} description={content.get('credit.description')}>
      <EmptyState title={content.get('credit.notBuiltTitle')} description={content.get('credit.notBuiltDescription')} />
    </PageLayout>
  )
}
