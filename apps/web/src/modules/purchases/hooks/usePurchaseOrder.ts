import { useQuery } from '@tanstack/react-query'
import { purchaseOrdersApi, purchaseOrdersKeys } from '../api/purchaseOrdersApi'

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: purchaseOrdersKeys.detail(id ?? ''),
    queryFn: () => purchaseOrdersApi.get(id as string),
    enabled: !!id,
  })
}
