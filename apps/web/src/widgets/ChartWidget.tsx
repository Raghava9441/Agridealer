import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card'

export type ChartType = 'line' | 'bar' | 'pie'

export interface ChartWidgetProps {
  title: string
  type: ChartType
  data: Record<string, unknown>[]
  dataKey: string
  categoryKey: string
  height?: number
}

// Reuses the same design tokens defined once in styles/tailwind.css — no separate chart palette to keep in sync with the brand color.
const BRAND = 'hsl(var(--color-brand))'
const PIE_COLORS = ['hsl(var(--color-brand))', 'hsl(150 40% 55%)', 'hsl(150 25% 70%)', 'hsl(150 12% 85%)']

/** Thin Recharts wrapper so every dashboard widget shares axis/tooltip/color styling instead of each chart re-deriving it. */
export function ChartWidget({ title, type, data, dataKey, categoryKey, height = 240 }: ChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-muted))" />
            <XAxis dataKey={categoryKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={BRAND} strokeWidth={2} dot={false} />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-muted))" />
            <XAxis dataKey={categoryKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Tooltip />
            <Pie data={data} dataKey={dataKey} nameKey={categoryKey} outerRadius={80}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}
