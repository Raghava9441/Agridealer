import { createUserSchema, ROLES, type CreateUserInput } from '@agridealer/contracts'
import { DynamicForm, type FieldConfig } from '@/shared/components/dynamic/DynamicForm'
import { useCreateUser } from '../hooks/useCreateUser'
import type { StaffUser } from '../api/usersApi'

const fields: FieldConfig<CreateUserInput>[] = [
  { name: 'name', labelKey: 'settings.users.fields.name', type: 'text' },
  { name: 'email', labelKey: 'settings.users.fields.email', type: 'email' },
  { name: 'password', labelKey: 'settings.users.fields.password', type: 'password' },
  {
    name: 'role',
    labelKey: 'settings.users.fields.role',
    type: 'select',
    options: ROLES.map((role) => ({ value: role, labelKey: `settings.users.roleOptions.${role}` })),
  },
]

export function CreateUserForm({ onSuccess }: { onSuccess: (user: StaffUser) => void }) {
  const { mutateAsync, isPending } = useCreateUser()

  return (
    <DynamicForm
      schema={createUserSchema}
      fields={fields}
      isSubmitting={isPending}
      submitLabelKey="settings.users.addStaff"
      onSubmit={async (values) => {
        const user = await mutateAsync(values)
        onSuccess(user)
      }}
    />
  )
}
