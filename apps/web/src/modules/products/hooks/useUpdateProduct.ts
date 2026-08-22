import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateProductInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { productsApi, productsKeys } from '../api/productsApi'

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) => productsApi.update(id, input),
    onSuccess: (_product, { id }) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) })
      dispatch(toastPushed({ variant: 'success', messageKey: 'products.updateSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'products.updateError' }))
    },
  })
}
