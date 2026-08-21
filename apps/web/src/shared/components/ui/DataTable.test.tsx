import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { renderWithProviders } from '@/shared/testing/renderWithProviders'
import { DataTable } from './DataTable'

interface Row {
  id: string
  name: string
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
]

describe('DataTable', () => {
  it('renders one row per data item', () => {
    renderWithProviders(
      <DataTable columns={columns} data={[{ id: '1', name: 'Ravi' }, { id: '2', name: 'Priya' }]} />,
    )
    expect(screen.getByText('Ravi')).toBeInTheDocument()
    expect(screen.getByText('Priya')).toBeInTheDocument()
  })

  it('shows the empty state when there is no data', () => {
    renderWithProviders(<DataTable columns={columns} data={[]} emptyTitle="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows loading skeletons instead of rows while isLoading', () => {
    renderWithProviders(<DataTable columns={columns} data={[]} isLoading />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
