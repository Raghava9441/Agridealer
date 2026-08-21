import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateTenantProfileInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { tenantApi, tenantKeys } from '../api/tenantApi'

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: UpdateTenantProfileInput) => tenantApi.updateProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tenantKeys.profile })
      dispatch(toastPushed({ variant: 'success', messageKey: 'settings.profile.saveSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'settings.profile.saveError' }))
    },
  })
}
