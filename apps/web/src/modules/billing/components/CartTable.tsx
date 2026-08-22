import { useCartStore } from '../hooks/useCartStore'
import { useContent } from '@/cms/useContent'
import { usePermission } from '@/permissions/hooks'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useAppSelector } from '@/store'
import { selectPreferences } from '@/store/slices/preferencesSlice'
import { formatMoney } from '@/utils/format'

export function CartTable() {
  const { lines, updateLine, removeLine } = useCartStore()
  const content = useContent()
  const canEditPrice = usePermission('billing:editPrice')
  const { locale } = useAppSelector(selectPreferences)

  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">{content.get('billing.cartEmpty')}</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-muted text-start text-muted-foreground">
          <th className="py-2">{content.get('billing.fields.product')}</th>
          <th className="py-2">{content.get('billing.fields.quantity')}</th>
          <th className="py-2">{content.get('billing.fields.unitPrice')}</th>
          <th className="py-2">{content.get('billing.fields.discount')}</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className="border-b border-muted">
            <td className="py-2">{line.productName}</td>
            <td className="py-2">
              <Input
                type="number"
                min={1}
                className="h-9 w-20"
                value={line.quantity}
                onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })}
              />
            </td>
            <td className="py-2">
              {/* Left editable for every role, unlike discount below: there's no
                  product price list on the backend (Product has no price field
                  at all — see productsApi.ts), so this is the only way a price
                  ever gets set. Gating it behind billing:editPrice would leave
                  anyone without that permission unable to complete a sale at
                  all, rather than just unable to discount one. */}
              <Input
                type="number"
                min={0}
                className="h-9 w-24"
                value={line.unitPrice}
                onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })}
              />
            </td>
            <td className="py-2">
              {canEditPrice ? (
                <Input
                  type="number"
                  min={0}
                  className="h-9 w-24"
                  value={line.discountAmount}
                  onChange={(e) => updateLine(line.id, { discountAmount: Number(e.target.value) })}
                />
              ) : (
                <span className="text-muted-foreground">{formatMoney(Math.round(line.discountAmount * 100), locale)}</span>
              )}
            </td>
            <td className="py-2">
              <Button variant="secondary" size="sm" onClick={() => removeLine(line.id)}>
                {content.get('common.remove')}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
