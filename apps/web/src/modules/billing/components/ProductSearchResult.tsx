import { useStockSummary } from '@/modules/inventory/hooks/useStockSummary'
import { useContent } from '@/cms/useContent'
import { Button } from '@/shared/components/ui/Button'
import type { Product } from '@/modules/products/api/productsApi'

/** One row per matched product — its own useStockSummary() call, so hooks aren't called in a loop from the parent. */
export function ProductSearchResult({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const { data: stock, isLoading } = useStockSummary(product._id)
  const content = useContent()

  return (
    <div className="flex items-center justify-between gap-3 border-b border-muted px-3 py-2 text-sm">
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {product.sku} ·{' '}
          {isLoading
            ? content.get('common.loading')
            : content.get('billing.stockAvailable', { count: stock?.totalQuantityAvailable ?? 0, unit: product.unit })}
        </p>
      </div>
      <Button size="sm" onClick={() => onAdd(product)} disabled={!isLoading && stock?.totalQuantityAvailable === 0}>
        {content.get('billing.addToCart')}
      </Button>
    </div>
  )
}
