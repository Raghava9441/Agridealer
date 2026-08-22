import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateVendorInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { vendorsApi, vendorsKeys } from '../api/vendorsApi'

export function useUpdateVendor() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendorInput }) => vendorsApi.update(id, input),
    onSuccess: (_vendor, { id }) => {
      void queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: vendorsKeys.detail(id) })
      dispatch(toastPushed({ variant: 'success', messageKey: 'purchases.vendors.updateSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'purchases.vendors.updateError' }))
    },
  })
}
