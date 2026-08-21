import { Drawer } from '@/shared/components/ui/Drawer'
import { useContent } from '@/cms/useContent'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { formatMoney } from '@/utils/format'
import { InvoiceList } from '@/modules/billing/components/InvoiceList'
import type { Customer } from '../api/customersApi'

export function CustomerOrdersDrawer({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const content = useContent()
  const { locale } = useAppSelector(selectPreferences)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={customer?.name ?? ''}>
      {customer && (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{content.get('customers.fields.phone')}</dt>
            <dd>{customer.phone}</dd>
            <dt className="text-muted-foreground">{content.get('customers.fields.balance')}</dt>
            <dd>{formatMoney(customer.currentBalancePaise, locale)}</dd>
            <dt className="text-muted-foreground">{content.get('customers.fields.creditLimit')}</dt>
            <dd>{formatMoney(customer.creditLimitPaise, locale)}</dd>
            <dt className="text-muted-foreground">{content.get('customers.fields.creditDays')}</dt>
            <dd>{customer.creditDays}</dd>
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold">{content.get('customers.ordersTitle')}</h3>
            <InvoiceList customerId={customer._id} />
          </div>
        </div>
      )}
    </Drawer>
  )
}
