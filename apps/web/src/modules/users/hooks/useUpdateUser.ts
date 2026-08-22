import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateUserInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { usersApi, usersKeys } from '../api/usersApi'

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => usersApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'settings.users.updateSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'settings.users.updateError' }))
    },
  })
}
