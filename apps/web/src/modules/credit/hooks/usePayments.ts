import { useQuery } from '@tanstack/react-query'
import { paymentsApi, paymentsKeys, type PaymentListFilter } from '../api/paymentsApi'

export function usePayments(filter: PaymentListFilter = {}) {
  return useQuery({
    queryKey: paymentsKeys.list(filter),
    queryFn: () => paymentsApi.list(filter),
  })
}
