import { useQuery } from '@tanstack/react-query'
import { invoicesApi, invoicesKeys } from '../api/invoicesApi'

export function useInvoices(customerId?: string) {
  return useQuery({
    queryKey: invoicesKeys.list(customerId),
    queryFn: () => invoicesApi.list(customerId),
  })
}
