import { appConfig } from '@/bootstrap/config'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
  requestId?: string
  userId?: string
  tenantId?: string
}

/** Where a log line actually goes. Swap/add sinks (Sentry, Datadog, OTel) without touching any `logger.*()` call site. */
export interface LogSink {
  write(level: LogLevel, event: string, context?: LogContext): void
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const MIN_LEVEL: LogLevel = appConfig.environment === 'development' ? 'debug' : 'info'

const consoleSink: LogSink = {
  write(level, event, context) {
    const method = level === 'debug' ? 'log' : level
    // eslint-disable-next-line no-console
    console[method](`[${event}]`, context ?? {})
  },
}

/**
 * A `RemoteSink` (Sentry/Datadog/OTel adapter) implements the same
 * `LogSink` interface and gets pushed into `sinks` — nothing else in the
 * app changes. No vendor SDK is installed yet, so only the console sink is
 * active.
 */
const sinks: LogSink[] = [consoleSink]

export function addLogSink(sink: LogSink): void {
  sinks.push(sink)
}

function log(level: LogLevel, event: string, context?: LogContext): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return
  for (const sink of sinks) sink.write(level, event, context)
}

export const logger = {
  debug: (event: string, context?: LogContext) => log('debug', event, context),
  info: (event: string, context?: LogContext) => log('info', event, context),
  warn: (event: string, context?: LogContext) => log('warn', event, context),
  error: (event: string, context?: LogContext) => log('error', event, context),
}
