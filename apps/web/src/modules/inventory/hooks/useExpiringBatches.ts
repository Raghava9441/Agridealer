import { useQuery } from '@tanstack/react-query'
import { inventoryApi, inventoryKeys } from '../api/inventoryApi'

export function useExpiringBatches(days = 30) {
  return useQuery({
    queryKey: inventoryKeys.expiring(days),
    queryFn: () => inventoryApi.getExpiring(days),
  })
}
