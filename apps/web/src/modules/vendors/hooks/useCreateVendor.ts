import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateVendorInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { vendorsApi, vendorsKeys } from '../api/vendorsApi'

export function useCreateVendor() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreateVendorInput) => vendorsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'purchases.vendors.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'purchases.vendors.createError' }))
    },
  })
}
