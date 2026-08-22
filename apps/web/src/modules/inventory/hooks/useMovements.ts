import { useQuery } from '@tanstack/react-query'
import { inventoryApi, inventoryKeys } from '../api/inventoryApi'

export function useMovements(productId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.movements(productId ?? ''),
    queryFn: () => inventoryApi.getMovements(productId as string),
    enabled: !!productId,
  })
}
