import { useContent } from '@/cms/useContent'
import { KpiCard } from '@/widgets/KpiCard'
import { ChartWidget, type ChartType } from '@/widgets/ChartWidget'

export interface KpiWidgetConfig {
  id: string
  type: 'kpi'
  titleKey: string
  value: string | number
  deltaLabelKey?: string
  /** Grid columns out of 12 — see DashboardRenderer. */
  span?: number
}

export interface ChartWidgetConfig {
  id: string
  type: 'chart'
  titleKey: string
  chartType: ChartType
  data: Record<string, unknown>[]
  dataKey: string
  categoryKey: string
  span?: number
}

export type WidgetConfig = KpiWidgetConfig | ChartWidgetConfig

/** Widget metadata → the concrete widget component — the dashboard's shape is data, not JSX. */
export function WidgetRenderer({ widget }: { widget: WidgetConfig }) {
  const content = useContent()

  if (widget.type === 'kpi') {
    return (
      <KpiCard
        title={content.get(widget.titleKey)}
        value={widget.value}
        deltaLabel={widget.deltaLabelKey ? content.get(widget.deltaLabelKey) : undefined}
      />
    )
  }

  return (
    <ChartWidget
      title={content.get(widget.titleKey)}
      type={widget.chartType}
      data={widget.data}
      dataKey={widget.dataKey}
      categoryKey={widget.categoryKey}
    />
  )
}
