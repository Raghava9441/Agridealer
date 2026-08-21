import { useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useContent } from '@/cms/useContent'
import { exportToCsv } from '@/workers/csvExport'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'
import { Button } from './Button'
import { cn } from '@/shared/lib/cn'

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  /** Omit for client-side sorting; pass both to hand sorting off to the server. */
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  getRowId?: (row: T) => string
  exportFilename?: string
}

const ROW_HEIGHT_PX = 44
/** Below this, virtualization overhead isn't worth it — most pages of this app show a page of ~25-100 rows. */
const VIRTUALIZE_THRESHOLD = 50

/**
 * TanStack Table (columns/sorting/selection/visibility) + TanStack Virtual
 * (row windowing once a result set gets long) composed into one component so
 * every module renders lists the same way instead of hand-rolling `<table>`
 * per screen. Server pagination is the caller's responsibility (pass
 * already-paginated `data`) — this component renders one page at a time,
 * consistent with how every list endpoint built this session works.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle,
  emptyDescription,
  sorting,
  onSortingChange,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  exportFilename,
}: DataTableProps<T>) {
  const content = useContent()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const manualSorting = sorting !== undefined && onSortingChange !== undefined

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: manualSorting ? sorting : internalSorting,
      columnVisibility,
      rowSelection: rowSelection ?? {},
    },
    columnResizeMode: 'onChange',
    enableRowSelection,
    manualSorting,
    getRowId,
    onSortingChange: manualSorting
      ? (updater) => onSortingChange(typeof updater === 'function' ? updater(sorting) : updater)
      : setInternalSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => onRowSelectionChange(typeof updater === 'function' ? updater(rowSelection ?? {}) : updater)
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 10,
    enabled: shouldVirtualize,
  })

  const handleExport = () => {
    const visibleColumns = table.getVisibleLeafColumns()
    void exportToCsv(exportFilename ?? 'export.csv', {
      columns: visibleColumns.map((c) => c.id),
      rows: rows.map((r) => r.original as Record<string, unknown>),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? content.get('dataTable.emptyTitle')} description={emptyDescription} />
  }

  const virtualRows = shouldVirtualize ? virtualizer.getVirtualItems() : rows.map((_, index) => ({ index, start: index * ROW_HEIGHT_PX, key: index }))
  const totalHeight = shouldVirtualize ? virtualizer.getTotalSize() : rows.length * ROW_HEIGHT_PX

  return (
    <div className="flex flex-col gap-2">
      {exportFilename && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            {content.get('dataTable.exportCsv')}
          </Button>
        </div>
      )}

      <div ref={scrollRef} className="max-h-[70vh] overflow-auto rounded border border-muted">
        <table className="w-full border-collapse text-sm" style={{ width: table.getTotalSize() }}>
          <thead className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative select-none border-b border-muted px-3 py-2 text-start font-medium"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn('flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer')}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                      </button>
                    )}
                    {header.column.getCanResize() && (
                      <button
                        type="button"
                        aria-label={content.get('dataTable.resizeColumn')}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onKeyDown={(e) => {
                          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
                          e.preventDefault()
                          const delta = e.key === 'ArrowRight' ? 10 : -10
                          table.setColumnSizing((old) => ({
                            ...old,
                            [header.column.id]: Math.max(40, header.column.getSize() + delta),
                          }))
                        }}
                        className="absolute end-0 top-0 h-full min-h-0 w-1 cursor-col-resize select-none p-0 focus:bg-brand focus:outline-none"
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ position: 'relative', height: totalHeight }}>
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null
              return (
                <tr
                  key={row.id}
                  className={cn('absolute left-0 w-full border-b border-muted hover:bg-muted/50', row.getIsSelected() && 'bg-muted/70')}
                  style={{ transform: `translateY(${virtualRow.start}px)`, height: ROW_HEIGHT_PX }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{content.get('dataTable.rowCount', { count: rows.length })}</p>
    </div>
  )
}
