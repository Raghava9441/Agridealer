import { Card } from '@/shared/components/ui/Card'

export function KpiCard({ title, value, deltaLabel }: { title: string; value: string | number; deltaLabel?: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {deltaLabel && <p className="mt-1 text-xs text-muted-foreground">{deltaLabel}</p>}
    </Card>
  )
}
