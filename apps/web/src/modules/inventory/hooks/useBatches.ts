import { useQuery } from '@tanstack/react-query'
import { inventoryApi, inventoryKeys } from '../api/inventoryApi'

export function useBatches(productId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.batches(productId ?? ''),
    queryFn: () => inventoryApi.getBatches(productId as string),
    enabled: !!productId,
  })
}
