import { useContent } from '@/cms/useContent'

export function LoadingOverlay({ visible }: { visible: boolean }) {
  const content = useContent()
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 backdrop-blur-sm"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span className="sr-only">{content.get('common.loading')}</span>
    </div>
  )
}
