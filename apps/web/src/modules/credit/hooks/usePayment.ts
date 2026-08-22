import { useQuery } from '@tanstack/react-query'
import { paymentsApi, paymentsKeys } from '../api/paymentsApi'

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: paymentsKeys.detail(id ?? ''),
    queryFn: () => paymentsApi.get(id as string),
    enabled: !!id,
  })
}
