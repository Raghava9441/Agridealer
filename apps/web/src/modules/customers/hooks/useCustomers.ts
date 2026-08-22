import { useQuery } from '@tanstack/react-query'
import { customersApi, customersKeys } from '../api/customersApi'

export function useCustomers(search = '') {
  return useQuery({
    queryKey: customersKeys.list({ search: search || undefined }),
    queryFn: () => customersApi.list({ search: search || undefined }),
  })
}
