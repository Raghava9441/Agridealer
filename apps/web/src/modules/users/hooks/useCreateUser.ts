import { useMutation } from '@tanstack/react-query'
import type { CreateUserInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { usersApi } from '../api/usersApi'

// No query cache to invalidate — the users API has no list/get endpoint yet
// (usersApi.ts), so there's nothing else in the app whose cached data this
// mutation could make stale.
export function useCreateUser() {
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => {
      dispatch(toastPushed({ variant: 'success', messageKey: 'settings.users.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'settings.users.createError' }))
    },
  })
}
