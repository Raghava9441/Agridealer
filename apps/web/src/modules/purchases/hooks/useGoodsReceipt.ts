import { useQuery } from '@tanstack/react-query'
import { goodsReceiptsApi, goodsReceiptsKeys } from '../api/goodsReceiptsApi'

export function useGoodsReceipt(id: string | undefined) {
  return useQuery({
    queryKey: goodsReceiptsKeys.detail(id ?? ''),
    queryFn: () => goodsReceiptsApi.get(id as string),
    enabled: !!id,
  })
}
