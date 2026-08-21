import { useState } from 'react'
import { useProducts } from '@/modules/products/hooks/useProducts'
import { useContent } from '@/cms/useContent'
import { SearchBar } from '@/shared/components/ui/SearchBar'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { LoadingOverlay } from '@/shared/components/ui/LoadingOverlay'
import { formatMoney } from '@/utils/format'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { useCartStore, type CartLine } from '../hooks/useCartStore'
import { useCreateInvoice } from '../hooks/useCreateInvoice'
import { ProductSearchResult } from './ProductSearchResult'
import { CartTable } from './CartTable'
import { CustomerPicker } from './CustomerPicker'
import { DownloadBillButton } from './DownloadBillButton'
import type { Product } from '@/modules/products/api/productsApi'
import type { Invoice } from '../api/invoicesApi'

/** Rupee floats (cart, operator-facing) → integer paise (the backend's Invoice contract) — the one place this conversion happens. */
function toPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

export function PosScreen() {
  const [search, setSearch] = useState('')
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null)
  const { data: products, isLoading: searching } = useProducts(search)
  const { lines, customerId, clear } = useCartStore()
  const addLine = useCartStore((s) => s.addLine)
  const { locale } = useAppSelector(selectPreferences)
  const { mutateAsync, isPending } = useCreateInvoice()
  const content = useContent()

  const handleAdd = (product: Product) => {
    const line: CartLine = {
      id: crypto.randomUUID(),
      productId: product._id,
      productName: product.name,
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
    }
    addLine(line)
    setLastInvoice(null)
  }

  const grandTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice - l.discountAmount, 0)

  const handleCheckout = async () => {
    const invoice = await mutateAsync({
      customerId: customerId ?? undefined,
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPricePaise: toPaise(l.unitPrice),
        discountPaise: toPaise(l.discountAmount),
      })),
    })
    setLastInvoice(invoice)
    clear()
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="relative">
        <h2 className="mb-3 text-base font-semibold">{content.get('billing.findProduct')}</h2>
        <SearchBar value={search} onSearch={setSearch} placeholderKey="billing.searchProductsPlaceholder" />
        <LoadingOverlay visible={searching} />
        <div className="mt-3 max-h-96 overflow-y-auto">
          {(products ?? []).map((product) => (
            <ProductSearchResult key={product._id} product={product} onAdd={handleAdd} />
          ))}
          {search && !searching && products?.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">{content.get('billing.noProductsFound')}</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">{content.get('billing.currentSale')}</h2>

        {lastInvoice && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded border border-brand bg-muted/40 px-3 py-2 text-sm">
            <span>
              {content.get('billing.saleComplete', { invoiceNumber: lastInvoice.invoiceNumber })}
            </span>
            <DownloadBillButton invoice={lastInvoice} />
          </div>
        )}

        <CustomerPicker />
        <CartTable />
        <div className="mt-4 flex items-center justify-between border-t border-muted pt-3">
          <span className="text-sm text-muted-foreground">{content.get('billing.total')}</span>
          <span className="text-lg font-semibold">{formatMoney(toPaise(grandTotal), locale)}</span>
        </div>
        <Button className="mt-4 w-full" disabled={lines.length === 0 || isPending} onClick={() => void handleCheckout()}>
          {isPending ? content.get('billing.finalizing') : content.get('billing.finalizeSale')}
        </Button>
      </Card>
    </div>
  )
}
