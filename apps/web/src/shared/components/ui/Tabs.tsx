import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/shared/lib/cn'

export interface TabItem {
  value: string
  label: string
  content: React.ReactNode
}

export function Tabs({
  items,
  defaultValue,
  className,
}: {
  items: TabItem[]
  defaultValue?: string
  className?: string
}) {
  return (
    <RadixTabs.Root defaultValue={defaultValue ?? items[0]?.value} className={className}>
      <RadixTabs.List className="flex gap-1 border-b border-muted">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              'px-3 py-2 text-sm text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:font-medium data-[state=active]:text-current',
            )}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value} className="pt-4">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
