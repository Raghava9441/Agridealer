import { useQuery } from '@tanstack/react-query'
import { productsApi, productsKeys } from '../api/productsApi'

export function useProducts(search = '') {
  return useQuery({
    queryKey: productsKeys.list({ search: search || undefined }),
    queryFn: () => productsApi.list({ search: search || undefined }),
    enabled: search.length > 0,
  })
}
