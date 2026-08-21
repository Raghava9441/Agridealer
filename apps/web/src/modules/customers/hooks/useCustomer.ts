import { useQuery } from '@tanstack/react-query'
import { customersApi, customersKeys } from '../api/customersApi'

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customersKeys.detail(id ?? ''),
    queryFn: () => customersApi.get(id as string),
    enabled: !!id,
  })
}
