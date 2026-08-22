import { useQuery } from '@tanstack/react-query'
import { vendorsApi, vendorsKeys } from '../api/vendorsApi'

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: vendorsKeys.detail(id ?? ''),
    queryFn: () => vendorsApi.get(id as string),
    enabled: !!id,
  })
}
