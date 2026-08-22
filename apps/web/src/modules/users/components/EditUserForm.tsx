import { updateUserSchema, ROLES, type UpdateUserInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { useUpdateUser } from '../hooks/useUpdateUser'
import type { StaffUser } from '../api/usersApi'

const fields: FieldConfig<UpdateUserInput>[] = [
  {
    name: 'role',
    labelKey: 'settings.users.fields.role',
    type: 'select',
    options: ROLES.map((role) => ({ value: role, labelKey: `settings.users.roleOptions.${role}` })),
  },
  {
    name: 'status',
    labelKey: 'settings.users.fields.status',
    type: 'select',
    options: [
      { value: 'active', labelKey: 'settings.users.statusOptions.active' },
      { value: 'disabled', labelKey: 'settings.users.statusOptions.disabled' },
    ],
  },
]

export function EditUserForm({ user, onSuccess }: { user: StaffUser; onSuccess: (user: StaffUser) => void }) {
  const { mutateAsync, isPending } = useUpdateUser()

  return (
    <DynamicForm
      schema={updateUserSchema}
      fields={fields}
      defaultValues={{ role: user.role, status: user.status }}
      isSubmitting={isPending}
      submitLabelKey="common.save"
      onSubmit={async (values) => {
        const updated = await mutateAsync({ id: user.id, input: values })
        onSuccess(updated)
      }}
    />
  )
}
