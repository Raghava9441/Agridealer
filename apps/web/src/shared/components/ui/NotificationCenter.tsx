import { useEffect } from 'react'
import { useContent } from '@/cms/useContent'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectToasts, toastDismissed, type Toast } from '@/store/slices/notificationsSlice'
import { cn } from '@/shared/lib/cn'

const VARIANT_STYLES: Record<Toast['variant'], string> = {
  info: 'border-muted bg-surface',
  success: 'border-brand bg-surface',
  warning: 'border-yellow-500 bg-surface',
  error: 'border-danger bg-surface',
}

const AUTO_DISMISS_MS = 5000

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const content = useContent()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast.id, dispatch])

  return (
    <div
      role="status"
      className={cn('rounded border px-4 py-3 text-sm shadow-md', VARIANT_STYLES[toast.variant])}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{content.get(toast.messageKey, toast.messageParams)}</span>
        <button
          type="button"
          aria-label={content.get('common.dismiss')}
          className="text-muted-foreground"
          onClick={() => dispatch(toastDismissed(toast.id))}
        >
          ×
        </button>
      </div>
    </div>
  )
}

/** Mounted once near the root (app/providers.tsx) — every `toastPushed()` dispatch anywhere in the app renders here. */
export function NotificationCenter() {
  const toasts = useAppSelector(selectToasts)

  return (
    <div aria-live="polite" className="fixed end-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
