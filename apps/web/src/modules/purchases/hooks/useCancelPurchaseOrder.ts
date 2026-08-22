import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { purchaseOrdersApi, purchaseOrdersKeys } from '../api/purchaseOrdersApi'

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.cancel(id, crypto.randomUUID()),
    onSuccess: (po) => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.detail(po._id) })
      dispatch(toastPushed({ variant: 'success', messageKey: 'purchases.orders.cancelSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'purchases.orders.cancelError' }))
    },
  })
}
