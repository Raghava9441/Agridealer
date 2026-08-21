import { useQuery } from '@tanstack/react-query'
import { customersApi, customersKeys } from '../api/customersApi'

export function useCustomers(search = '') {
  return useQuery({
    queryKey: customersKeys.list(search),
    queryFn: () => customersApi.list(search || undefined),
  })
}
