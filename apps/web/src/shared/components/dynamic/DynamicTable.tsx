import { useMemo, type ReactNode } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useContent } from '@/cms/useContent'
import { DataTable } from '../ui/DataTable'

export interface ColumnConfig<T> {
  key: string
  /** CMS content key for the header label — see cms/useContent.ts. */
  headerKey: string
  sortable?: boolean
  width?: number
  format?: (value: unknown, row: T) => ReactNode
}

export interface DynamicTableProps<T> {
  columns: ColumnConfig<T>[]
  data: T[]
  isLoading?: boolean
  emptyTitleKey?: string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  exportFilename?: string
}

/** Column *configuration* → TanStack ColumnDef, so a module lists what it wants shown without touching TanStack Table's API directly. */
export function DynamicTable<T>({
  columns,
  data,
  isLoading,
  emptyTitleKey,
  sorting,
  onSortingChange,
  exportFilename,
}: DynamicTableProps<T>) {
  const content = useContent()

  const columnDefs = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        header: content.get(col.headerKey),
        size: col.width,
        enableSorting: col.sortable ?? false,
        cell: col.format ? (ctx) => col.format?.(ctx.getValue(), ctx.row.original) : (ctx) => String(ctx.getValue() ?? ''),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `content` is stable per render language; re-keying on every t() identity change would defeat memoization
    [columns],
  )

  return (
    <DataTable
      columns={columnDefs}
      data={data}
      isLoading={isLoading}
      emptyTitle={emptyTitleKey ? content.get(emptyTitleKey) : undefined}
      sorting={sorting}
      onSortingChange={onSortingChange}
      exportFilename={exportFilename}
    />
  )
}
