import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCustomerInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { customersApi, customersKeys } from '../api/customersApi'

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'customers.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'customers.createError' }))
    },
  })
}
