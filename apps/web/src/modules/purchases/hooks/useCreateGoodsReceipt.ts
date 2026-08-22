import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateGoodsReceiptInput } from '@agridealer/contracts'
import { useAppDispatch } from '@/store'
import { toastPushed } from '@/store/slices/notificationsSlice'
import { inventoryKeys } from '@/modules/inventory/api/inventoryApi'
import { goodsReceiptsApi, goodsReceiptsKeys } from '../api/goodsReceiptsApi'
import { purchaseOrdersKeys } from '../api/purchaseOrdersApi'

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (input: CreateGoodsReceiptInput) => goodsReceiptsApi.create(input, crypto.randomUUID()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goodsReceiptsKeys.lists() })
      // A receipt tops up stock (affecting every product on it, not just
      // one) and can move its linked PO to partially_received/received —
      // both are broad, prefix-level invalidations rather than a specific key.
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      void queryClient.invalidateQueries({ queryKey: purchaseOrdersKeys.all })
      dispatch(toastPushed({ variant: 'success', messageKey: 'purchases.receipts.createSuccess' }))
    },
    onError: () => {
      dispatch(toastPushed({ variant: 'error', messageKey: 'purchases.receipts.createError' }))
    },
  })
}
