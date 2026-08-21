import { WidgetRenderer, type WidgetConfig } from './WidgetRenderer'

/** Renders a list of widget configs into a 12-column responsive grid — the whole dashboard is data (see routes/_app/dashboard.tsx once it's built on this). */
export function DashboardRenderer({ widgets }: { widgets: WidgetConfig[] }) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {widgets.map((widget) => (
        <div key={widget.id} style={{ gridColumn: `span ${widget.span ?? 4} / span ${widget.span ?? 4}` }}>
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </div>
  )
}
