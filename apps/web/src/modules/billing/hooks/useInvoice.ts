import { useQuery } from '@tanstack/react-query'
import { invoicesApi, invoicesKeys } from '../api/invoicesApi'

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoicesKeys.detail(id ?? ''),
    queryFn: () => invoicesApi.get(id as string),
    enabled: !!id,
  })
}
