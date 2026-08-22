import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateProductInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { productsApi, productsKeys } from '../api/productsApi'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'products.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'products.createError' }))
    },
  })
}
