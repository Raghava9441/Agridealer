import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '@/monitoring/logger'
import { EmptyState } from './ui/EmptyState'
import { Button } from './ui/Button'
import { useContent } from '@/cms/useContent'

function DefaultFallback({ onRetry }: { onRetry: () => void }) {
  const content = useContent()
  return (
    <EmptyState
      title={content.get('errors.boundaryTitle')}
      description={content.get('errors.boundaryDescription')}
      action={<Button onClick={onRetry}>{content.get('common.retry')}</Button>}
    />
  )
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Error boundaries must be class components (no hooks equivalent exists).
 * One mounted globally in routes/__root.tsx; module routes can wrap their
 * own content in another instance so a crash in, say, the billing screen
 * doesn't take down the whole shell — see modules/customers, modules/billing.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ui.errorBoundary', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
    })
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
