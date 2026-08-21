import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import { DynamicTable, type ColumnConfig } from '@/shared/components/dynamic/DynamicTable'
import { SearchBar } from '@/shared/components/ui/SearchBar'
import { Button } from '@/shared/components/ui/Button'
import { useContent } from '@/cms/useContent'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { formatMoney } from '@/utils/format'
import { CustomerOrdersDrawer } from './CustomerOrdersDrawer'
import type { Customer } from '../api/customersApi'

export function CustomerTable() {
  const [search, setSearch] = useState('')
  const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null)
  const { data, isLoading } = useCustomers(search)
  const { locale } = useAppSelector(selectPreferences)
  const content = useContent()

  const columns: ColumnConfig<Customer>[] = [
    { key: 'name', headerKey: 'customers.fields.name', sortable: true },
    { key: 'phone', headerKey: 'customers.fields.phone' },
    {
      key: 'currentBalancePaise',
      headerKey: 'customers.fields.balance',
      format: (value) => formatMoney(Number(value), locale),
    },
    { key: 'status', headerKey: 'customers.fields.status' },
    {
      key: '_id',
      headerKey: 'customers.fields.orders',
      format: (_value, row) => (
        <Button variant="secondary" size="sm" onClick={() => setOrdersCustomer(row)}>
          {content.get('customers.viewOrders')}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={search} onSearch={setSearch} placeholderKey="customers.searchPlaceholder" />
      <DynamicTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyTitleKey="customers.emptyTitle"
        exportFilename="customers.csv"
      />
      <CustomerOrdersDrawer customer={ordersCustomer} open={ordersCustomer !== null} onOpenChange={(open) => !open && setOrdersCustomer(null)} />
    </div>
  )
}
