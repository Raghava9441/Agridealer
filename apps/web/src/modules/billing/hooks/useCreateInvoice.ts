import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { syncQueue } from '@/offline/syncQueue'
import { invoicesApi, invoicesKeys, type CreateInvoiceInput, type Invoice } from '../api/invoicesApi'

export type CreateInvoiceResult = { status: 'created'; invoice: Invoice } | { status: 'queued' }

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput): Promise<CreateInvoiceResult> => {
      // One idempotency key per mutation *attempt* the caller makes, not per HTTP retry — generated
      // here (once per mutate() call) so a genuine double-submit (e.g. a stray extra click) is safe,
      // matching the backend's Idempotency-Key contract for money-moving mutations (docs §8.6). The
      // same key travels into the sync queue below, so a later replay can't double-create the invoice.
      const idempotencyKey = crypto.randomUUID()

      // Offline: the sale is still real to the person at the counter, it just
      // hasn't reached the server — defer it instead of letting fetch() fail.
      // There's no server-assigned invoiceNumber yet, so the caller (PosScreen)
      // gets a 'queued' result, not a fabricated Invoice.
      if (!navigator.onLine) {
        await syncQueue.enqueue({ type: 'invoice.create', payload: { input, idempotencyKey } })
        return { status: 'queued' }
      }

      const invoice = await invoicesApi.create(input, idempotencyKey)
      return { status: 'created', invoice }
    },
    onSuccess: (result) => {
      if (result.status === 'created') {
        void queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() })
        dispatch(toastPushed({ variant: 'success', messageKey: 'billing.saleSuccess' }))
      } else {
        dispatch(toastPushed({ variant: 'info', messageKey: 'billing.saleQueuedOffline' }))
      }
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'billing.saleError' }))
    },
  })
}
