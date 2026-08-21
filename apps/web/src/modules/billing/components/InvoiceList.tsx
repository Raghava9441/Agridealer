import { useInvoices } from '../hooks/useInvoices'
import { DynamicTable, type ColumnConfig } from '@/shared/components/dynamic/DynamicTable'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { formatDateTime, formatMoney } from '@/utils/format'
import { DownloadBillButton } from './DownloadBillButton'
import type { Invoice } from '../api/invoicesApi'

export function InvoiceList({ customerId }: { customerId?: string } = {}) {
  const { data, isLoading } = useInvoices(customerId)
  const { locale } = useAppSelector(selectPreferences)

  const columns: ColumnConfig<Invoice>[] = [
    { key: 'invoiceNumber', headerKey: 'billing.fields.invoiceNumber', sortable: true },
    { key: 'grandTotalPaise', headerKey: 'billing.fields.total', format: (v) => formatMoney(Number(v), locale) },
    { key: 'paymentStatus', headerKey: 'billing.fields.paymentStatus' },
    { key: 'createdAt', headerKey: 'billing.fields.date', format: (v) => formatDateTime(String(v), locale) },
    {
      key: '_id',
      headerKey: 'billing.bill',
      format: (_value, row) => <DownloadBillButton invoice={row} />,
    },
  ]

  return (
    <DynamicTable
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      emptyTitleKey="billing.noInvoicesYet"
      exportFilename="invoices.csv"
    />
  )
}
