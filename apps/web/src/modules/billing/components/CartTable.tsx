import { useCartStore } from '../hooks/useCartStore'
import { useContent } from '@/cms/useContent'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

export function CartTable() {
  const { lines, updateLine, removeLine } = useCartStore()
  const content = useContent()

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
              <Input
                type="number"
                min={0}
                className="h-9 w-24"
                value={line.unitPrice}
                onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })}
              />
            </td>
            <td className="py-2">
              <Input
                type="number"
                min={0}
                className="h-9 w-24"
                value={line.discountAmount}
                onChange={(e) => updateLine(line.id, { discountAmount: Number(e.target.value) })}
              />
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
