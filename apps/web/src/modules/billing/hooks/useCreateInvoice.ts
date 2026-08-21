import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { invoicesApi, invoicesKeys, type CreateInvoiceInput } from '../api/invoicesApi'

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    // One idempotency key per mutation *attempt* the caller makes, not per HTTP retry — generated
    // here (once per mutate() call) so a genuine double-submit (e.g. a stray extra click) is safe,
    // matching the backend's Idempotency-Key contract for money-moving mutations (docs §8.6).
    mutationFn: (input: CreateInvoiceInput) => invoicesApi.create(input, crypto.randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'billing.saleSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'billing.saleError' }))
    },
  })
}
