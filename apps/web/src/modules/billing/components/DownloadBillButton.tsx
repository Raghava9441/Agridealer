import { PDFDownloadLink } from '@react-pdf/renderer'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/slices/authSlice'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { useContent } from '@/cms/useContent'
import { useTenantProfile } from '@/modules/tenant/hooks/useTenantProfile'
import { Button } from '@/shared/components/ui/Button'
import { InvoiceBillDocument, type BillLabels } from './InvoiceBillDocument'
import type { Invoice } from '../api/invoicesApi'

/** PDF bill generation/download for one invoice — used in InvoiceList and right after a POS checkout. */
export function DownloadBillButton({ invoice }: { invoice: Invoice }) {
  const session = useAppSelector(selectSession)
  const { locale } = useAppSelector(selectPreferences)
  const { data: profile } = useTenantProfile()
  const content = useContent()

  if (!session) return null

  const labels: BillLabels = {
    bill: content.get('billing.downloadBill'),
    invoiceNumber: content.get('billing.fields.invoiceNumber'),
    date: content.get('billing.fields.date'),
    billTo: content.get('billing.billTo'),
    walkInCustomer: content.get('billing.walkInCustomer'),
    product: content.get('billing.fields.product'),
    quantity: content.get('billing.fields.quantity'),
    unitPrice: content.get('billing.fields.unitPrice'),
    discount: content.get('billing.fields.discount'),
    tax: content.get('billing.tax'),
    total: content.get('billing.fields.total'),
    subtotal: content.get('billing.subtotal'),
    discountTotal: content.get('billing.fields.discount'),
    taxTotal: content.get('billing.tax'),
    grandTotal: content.get('billing.fields.total'),
    amountPaid: content.get('billing.amountPaid'),
    balanceDue: content.get('billing.balanceDue'),
    gstin: content.get('customers.fields.gstin'),
    phone: content.get('customers.fields.phone'),
  }

  return (
    <PDFDownloadLink
      document={
        <InvoiceBillDocument
          invoice={invoice}
          dealer={{ name: session.tenant.name, address: profile?.address, gstin: profile?.gstin, phone: profile?.phone }}
          locale={locale}
          labels={labels}
        />
      }
      fileName={`${invoice.invoiceNumber}.pdf`}
    >
      {({ loading }) => (
        <Button variant="secondary" size="sm" disabled={loading}>
          {loading ? content.get('common.loading') : labels.bill}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
