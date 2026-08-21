import { useContent } from '@/cms/useContent'

export function RouteLoadingFallback() {
  const content = useContent()
  return (
    <div role="status" aria-live="polite" className="flex h-screen w-full items-center justify-center bg-surface">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span className="sr-only">{content.get('common.loading')}</span>
    </div>
  )
}
