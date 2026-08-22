import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePurchaseOrderInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { purchaseOrdersApi, purchaseOrdersKeys } from '../api/purchaseOrdersApi'

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    // Same one-key-per-attempt rule as useCreateInvoice: generated once per
    // mutate() call so a double-submit is safe, matching the backend's
    // idempotent() middleware on this route.
    mutationFn: (input: CreatePurchaseOrderInput) => purchaseOrdersApi.create(input, crypto.randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'purchases.orders.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'purchases.orders.createError' }))
    },
  })
}
