import { useQuery } from '@tanstack/react-query'
import { purchaseOrdersApi, purchaseOrdersKeys, type PurchaseOrderListFilter } from '../api/purchaseOrdersApi'

export function usePurchaseOrders(filter: PurchaseOrderListFilter = {}) {
  return useQuery({
    queryKey: purchaseOrdersKeys.list(filter),
    queryFn: () => purchaseOrdersApi.list(filter),
  })
}
