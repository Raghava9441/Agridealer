import { createCustomerSchema, type CreateCustomerInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { useCreateCustomer } from '../hooks/useCreateCustomer'
import type { Customer } from '../api/customersApi'

const fields: FieldConfig<CreateCustomerInput>[] = [
  { name: 'name', labelKey: 'customers.fields.name', type: 'text' },
  { name: 'phone', labelKey: 'customers.fields.phone', type: 'text' },
  { name: 'email', labelKey: 'customers.fields.email', type: 'email' },
  { name: 'gstin', labelKey: 'customers.fields.gstin', type: 'text' },
  { name: 'creditLimitPaise', labelKey: 'customers.fields.creditLimit', type: 'number' },
  { name: 'creditDays', labelKey: 'customers.fields.creditDays', type: 'number' },
]

export function CustomerForm({ onSuccess }: { onSuccess: (customer: Customer) => void }) {
  const { mutateAsync, isPending } = useCreateCustomer()

  return (
    <DynamicForm
      schema={createCustomerSchema}
      fields={fields}
      defaultValues={{ creditLimitPaise: 0, creditDays: 0 }}
      isSubmitting={isPending}
      submitLabelKey="customers.addCustomer"
      onSubmit={async (values) => {
        const customer = await mutateAsync(values)
        onSuccess(customer)
      }}
    />
  )
}
