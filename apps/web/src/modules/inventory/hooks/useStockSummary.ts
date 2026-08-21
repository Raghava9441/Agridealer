import { useQuery } from '@tanstack/react-query'
import { inventoryApi, inventoryKeys } from '../api/inventoryApi'

/** staleTime: 0 — stock levels are treated as always-stale (docs §5.3.1 table referenced in app/queryClient.ts), unlike catalogue data. */
export function useStockSummary(productId: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.stock(productId ?? ''),
    queryFn: () => inventoryApi.getStockSummary(productId as string),
    enabled: !!productId,
    staleTime: 0,
  })
}
