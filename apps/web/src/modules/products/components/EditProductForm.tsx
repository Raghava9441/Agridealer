import { updateProductSchema, PRODUCT_UNITS, type UpdateProductInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { useUpdateProduct } from '../hooks/useUpdateProduct'
import type { Product } from '../api/productsApi'

const fields: FieldConfig<UpdateProductInput>[] = [
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
  {
    name: 'status',
    labelKey: 'products.fields.status',
    type: 'select',
    options: [
      { value: 'active', labelKey: 'products.statusOptions.active' },
      { value: 'discontinued', labelKey: 'products.statusOptions.discontinued' },
    ],
  },
]

export function EditProductForm({ product, onSuccess }: { product: Product; onSuccess: (product: Product) => void }) {
  const { mutateAsync, isPending } = useUpdateProduct()

  return (
    <DynamicForm
      schema={updateProductSchema}
      fields={fields}
      defaultValues={{
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit: product.unit as UpdateProductInput['unit'],
        hsnCode: product.hsnCode,
        gstRatePercent: product.gstRatePercent,
        brand: product.brand,
        description: product.description,
        batchTracked: product.batchTracked,
        reorderLevel: product.reorderLevel,
        status: product.status,
      }}
      isSubmitting={isPending}
      submitLabelKey="common.save"
      onSubmit={async (values) => {
        const updated = await mutateAsync({ id: product._id, input: values })
        onSuccess(updated)
      }}
    />
  )
}
