import { useState } from 'react'
import { useProductsList } from '../hooks/useProductsList'
import { DynamicTable, type ColumnConfig } from '@/shared/components/dynamic/DynamicTable'
import { SearchBar } from '@/shared/components/ui/SearchBar'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { useContent } from '@/cms/useContent'
import { usePermission } from '@/permissions/hooks'
import { EditProductForm } from './EditProductForm'
import type { Product } from '../api/productsApi'

export function ProductTable() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const { data, isLoading } = useProductsList(search)
  const content = useContent()
  const canEdit = usePermission('products:edit')

  const columns: ColumnConfig<Product>[] = [
    { key: 'sku', headerKey: 'products.fields.sku', sortable: true },
    { key: 'name', headerKey: 'products.fields.name', sortable: true },
    { key: 'category', headerKey: 'products.fields.category' },
    { key: 'unit', headerKey: 'products.fields.unit', format: (value) => content.get(`products.unitOptions.${String(value)}`) },
    { key: 'gstRatePercent', headerKey: 'products.fields.gstRatePercent', format: (value) => `${String(value)}%` },
    { key: 'status', headerKey: 'products.fields.status', format: (value) => content.get(`products.statusOptions.${String(value)}`) },
    ...(canEdit
      ? [
          {
            key: '_id',
            headerKey: 'common.actions',
            format: (_value: unknown, row: Product) => (
              <Button variant="secondary" size="sm" onClick={() => setEditing(row)}>
                {content.get('common.edit')}
              </Button>
            ),
          } satisfies ColumnConfig<Product>,
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={search} onSearch={setSearch} placeholderKey="products.searchPlaceholder" />
      <DynamicTable columns={columns} data={data ?? []} isLoading={isLoading} emptyTitleKey="products.emptyTitle" exportFilename="products.csv" />
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title={content.get('products.editProduct')}>
        {editing && <EditProductForm product={editing} onSuccess={() => setEditing(null)} />}
      </Dialog>
    </div>
  )
}
