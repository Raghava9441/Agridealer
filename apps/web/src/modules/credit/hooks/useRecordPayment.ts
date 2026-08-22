import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePaymentInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { customersKeys } from '@/modules/customers/api/customersApi'
import { invoicesKeys } from '@/modules/billing/api/invoicesApi'
import { paymentsApi, paymentsKeys } from '../api/paymentsApi'

export function useRecordPayment() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentsApi.create(input, crypto.randomUUID()),
    onSuccess: (payment) => {
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() })
      // A payment changes the customer's currentBalancePaise and, via
      // appliedTo, the paymentStatus of whichever invoices it settles —
      // both are stale the moment this resolves.
      void queryClient.invalidateQueries({ queryKey: customersKeys.detail(payment.partyId) })
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() })
      dispatch(toastPushed({ variant: 'success', messageKey: 'credit.payments.recordSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'credit.payments.recordError' }))
    },
  })
}
