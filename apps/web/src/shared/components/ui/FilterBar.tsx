import type { ReactNode } from 'react'
import { Button } from './Button'
import { useContent } from '@/cms/useContent'

/**
 * A composable row for filter controls — callers pass whatever controls a
 * module needs (SearchBar, native selects, date inputs) as children rather
 * than this component owning a fixed filter schema, since filter shape
 * genuinely differs per module (status enum, date range, party lookup...).
 */
export function FilterBar({ children, onClear, hasActiveFilters }: { children: ReactNode; onClear?: () => void; hasActiveFilters?: boolean }) {
  const content = useContent()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {onClear && hasActiveFilters && (
        <Button variant="secondary" size="sm" onClick={onClear}>
          {content.get('common.clearFilters')}
        </Button>
      )}
    </div>
  )
}
