import { updateTenantProfileSchema, type UpdateTenantProfileInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { useContent } from '@/cms/useContent'
import { useTenantProfile } from '../hooks/useTenantProfile'
import { useUpdateTenantProfile } from '../hooks/useUpdateTenantProfile'

const fields: FieldConfig<UpdateTenantProfileInput>[] = [
  { name: 'phone', labelKey: 'customers.fields.phone', type: 'text' },
  { name: 'gstin', labelKey: 'customers.fields.gstin', type: 'text' },
  { name: 'address.line1', labelKey: 'settings.profile.addressLine1', type: 'text' },
  { name: 'address.line2', labelKey: 'settings.profile.addressLine2', type: 'text' },
  { name: 'address.city', labelKey: 'settings.profile.city', type: 'text' },
  { name: 'address.state', labelKey: 'settings.profile.state', type: 'text' },
  { name: 'address.pincode', labelKey: 'settings.profile.pincode', type: 'text' },
]

/** Dealer business profile (address/GSTIN/phone) — shown on the printable bill letterhead. */
export function TenantProfileForm() {
  const { data, isLoading } = useTenantProfile()
  const { mutateAsync, isPending } = useUpdateTenantProfile()
  const content = useContent()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  return (
    <DynamicForm
      schema={updateTenantProfileSchema}
      fields={fields}
      defaultValues={data}
      isSubmitting={isPending}
      submitLabelKey="common.save"
      onSubmit={async (values) => {
        await mutateAsync(values)
      }}
    />
  )
}
