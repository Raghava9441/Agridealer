import { useQuery } from '@tanstack/react-query'
import { productsApi, productsKeys } from '../api/productsApi'

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? ''),
    queryFn: () => productsApi.get(id as string),
    enabled: !!id,
  })
}
