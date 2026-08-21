import * as Sentry from '@sentry/react'
import { appConfig } from '@/bootstrap/config'
import { addLogSink, type LogSink } from '@/monitoring/logger'

/**
 * Sentry is optional infra, not a hard requirement: `sentryDsn` is unset in
 * local dev and in any deploy that hasn't been given one, and everything
 * here silently no-ops in that case — the app must never fail to boot
 * because a monitoring vendor wasn't configured.
 */
const sentrySink: LogSink = {
  write(level, event, context) {
    if (level === 'debug' || level === 'info') return // noise Sentry doesn't need; console sink still gets these.

    const sentryLevel = level === 'error' ? 'error' : 'warning'
    const stack = typeof context?.stack === 'string' ? context.stack : undefined

    if (stack) {
      // ErrorBoundary (ui.errorBoundary) hands us a message/stack pair rather
      // than the original Error object (it crosses the class-component
      // boundary as plain data) — rebuild an Error so Sentry can group and
      // symbolicate it like any other exception.
      const message = typeof context?.message === 'string' ? context.message : event
      const err = new Error(message)
      err.stack = stack
      Sentry.captureException(err, { level: sentryLevel, extra: context })
    } else {
      Sentry.captureMessage(event, { level: sentryLevel, extra: context })
    }
  },
}

export function initSentry(): void {
  if (!appConfig.sentryDsn) return

  Sentry.init({
    dsn: appConfig.sentryDsn,
    environment: appConfig.environment,
    // Keep trace sampling low in prod (cost + noise); off elsewhere since
    // local/staging traffic isn't representative of real usage.
    tracesSampleRate: appConfig.environment === 'production' ? 0.1 : 0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      // Network drops surface through apiClient's own retry/backoff
      // (src/core/http/apiClient.ts) and get logged there with more useful
      // context — reporting the bare fetch rejection again is just noise.
      'Failed to fetch',
    ],
  })

  addLogSink(sentrySink)
}
