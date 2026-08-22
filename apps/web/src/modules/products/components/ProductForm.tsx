import { createProductSchema, PRODUCT_UNITS, type CreateProductInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { useCreateProduct } from '../hooks/useCreateProduct'
import type { Product } from '../api/productsApi'

const fields: FieldConfig<CreateProductInput>[] = [
  { name: 'sku', labelKey: 'products.fields.sku', type: 'text' },
  { name: 'name', labelKey: 'products.fields.name', type: 'text' },
  { name: 'category', labelKey: 'products.fields.category', type: 'text' },
  {
    name: 'unit',
    labelKey: 'products.fields.unit',
    type: 'select',
    options: PRODUCT_UNITS.map((unit) => ({ value: unit, labelKey: `products.unitOptions.${unit}` })),
  },
  { name: 'hsnCode', labelKey: 'products.fields.hsnCode', type: 'text' },
  { name: 'gstRatePercent', labelKey: 'products.fields.gstRatePercent', type: 'number' },
  { name: 'brand', labelKey: 'products.fields.brand', type: 'text' },
  { name: 'description', labelKey: 'products.fields.description', type: 'textarea' },
  { name: 'batchTracked', labelKey: 'products.fields.batchTracked', type: 'checkbox' },
  { name: 'reorderLevel', labelKey: 'products.fields.reorderLevel', type: 'number' },
]

export function ProductForm({ onSuccess }: { onSuccess: (product: Product) => void }) {
  const { mutateAsync, isPending } = useCreateProduct()

  return (
    <DynamicForm
      schema={createProductSchema}
      fields={fields}
      defaultValues={{ batchTracked: true, reorderLevel: 0, gstRatePercent: 0 }}
      isSubmitting={isPending}
      submitLabelKey="products.addProduct"
      onSubmit={async (values) => {
        const product = await mutateAsync(values)
        onSuccess(product)
      }}
    />
  )
}
