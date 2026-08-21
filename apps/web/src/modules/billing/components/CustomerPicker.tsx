import { useState } from 'react'
import { useCustomers } from '@/modules/customers/hooks/useCustomers'
import { CustomerForm } from '@/modules/customers/components/CustomerForm'
import { useContent } from '@/cms/useContent'
import { SearchBar } from '@/shared/components/ui/SearchBar'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { useCartStore } from '../hooks/useCartStore'

/**
 * Search-and-attach (or create-inline) the customer a sale is for — a
 * typeahead in the same style as ProductSearchResult in this same screen,
 * not a modal search, since speed matters at the counter. Leaving no
 * customer attached keeps the sale a walk-in, same as before this existed.
 */
export function CustomerPicker() {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const { data: matches, isLoading } = useCustomers(search)
  const { customerId, customerName, setCustomer } = useCartStore()
  const content = useContent()

  if (customerId) {
    return (
      <div className="mb-3 flex items-center justify-between gap-3 rounded border border-muted bg-muted/40 px-3 py-2 text-sm">
        <span className="font-medium">{customerName ?? customerId}</span>
        <Button variant="secondary" size="sm" onClick={() => setCustomer(null)}>
          {content.get('billing.customer.change')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{content.get('billing.customer.label')}</label>
      <SearchBar value={search} onSearch={setSearch} placeholderKey="billing.customer.searchPlaceholder" />

      {search && (
        <div className="mt-1 max-h-48 overflow-y-auto rounded border border-muted">
          {isLoading && <p className="px-3 py-2 text-sm text-muted-foreground">{content.get('common.loading')}</p>}
          {!isLoading &&
            (matches ?? []).map((customer) => (
              <button
                key={customer._id}
                type="button"
                className="block w-full border-b border-muted px-3 py-2 text-start text-sm last:border-b-0 hover:bg-muted"
                onClick={() => {
                  setCustomer(customer._id, customer.name)
                  setSearch('')
                }}
              >
                <span className="font-medium">{customer.name}</span>{' '}
                <span className="text-muted-foreground">{customer.phone}</span>
              </button>
            ))}
          {!isLoading && matches?.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">{content.get('billing.customer.noMatches')}</p>
          )}
        </div>
      )}

      <Button variant="secondary" size="sm" className="mt-2" onClick={() => setCreateOpen(true)}>
        {content.get('billing.customer.newCustomer')}
      </Button>

      <Dialog open={createOpen} onOpenChange={setCreateOpen} title={content.get('customers.addCustomer')}>
        <CustomerForm
          onSuccess={(customer) => {
            setCustomer(customer._id, customer.name)
            setSearch('')
            setCreateOpen(false)
          }}
        />
      </Dialog>
    </div>
  )
}
