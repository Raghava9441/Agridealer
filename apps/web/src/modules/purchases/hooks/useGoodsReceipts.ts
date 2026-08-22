import { useQuery } from '@tanstack/react-query'
import { goodsReceiptsApi, goodsReceiptsKeys, type GoodsReceiptListFilter } from '../api/goodsReceiptsApi'

export function useGoodsReceipts(filter: GoodsReceiptListFilter = {}) {
  return useQuery({
    queryKey: goodsReceiptsKeys.list(filter),
    queryFn: () => goodsReceiptsApi.list(filter),
  })
}
