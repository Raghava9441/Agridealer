import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { DynamicTable, type ColumnConfig } from '@/shared/components/dynamic/DynamicTable'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { useContent } from '@/cms/useContent'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/slices/authSlice'
import { EditUserForm } from './EditUserForm'
import type { StaffUser } from '../api/usersApi'

export function UserTable() {
  const [editing, setEditing] = useState<StaffUser | null>(null)
  const { data, isLoading } = useUsers()
  const content = useContent()
  const currentUserId = useAppSelector(selectSession)?.userId

  const columns: ColumnConfig<StaffUser>[] = [
    { key: 'name', headerKey: 'settings.users.fields.name', sortable: true },
    { key: 'email', headerKey: 'settings.users.fields.email' },
    { key: 'role', headerKey: 'settings.users.fields.role', format: (value) => content.get(`settings.users.roleOptions.${String(value)}`) },
    { key: 'status', headerKey: 'settings.users.fields.status', format: (value) => content.get(`settings.users.statusOptions.${String(value)}`) },
    {
      key: 'id',
      headerKey: 'common.actions',
      // Mirrors the backend's own guard (UsersService.update rejects
      // id === actingUserId) — a disabled button's hover tooltip is
      // unreliable (disabled:pointer-events-none blocks the hover that
      // would trigger it), so this reads as a plain note instead of an
      // Edit control that appears broken.
      format: (_value, row) =>
        row.id === currentUserId ? (
          <span className="text-sm text-muted-foreground">{content.get('settings.users.thatsYou')}</span>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setEditing(row)}>
            {content.get('common.edit')}
          </Button>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DynamicTable columns={columns} data={data ?? []} isLoading={isLoading} emptyTitleKey="settings.users.emptyTitle" />
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title={content.get('settings.users.editStaff')}>
        {editing && <EditUserForm user={editing} onSuccess={() => setEditing(null)} />}
      </Dialog>
    </div>
  )
}
