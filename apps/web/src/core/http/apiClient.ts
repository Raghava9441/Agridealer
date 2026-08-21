import { appConfig } from '@/bootstrap/config'
import { getAccessToken } from '@/shared/lib/authToken'
import { logger } from '@/monitoring/logger'

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown
  /** Whether the server says this exact request can be safely retried unchanged. */
  readonly retryable: boolean

  constructor(code: string, status: number, message: string, details?: unknown, retryable = false) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
    this.retryable = retryable
  }
}

export interface ApiRequestOptions extends RequestInit {
  idempotencyKey?: string
  /** Skip the single-flight refresh-and-retry dance — used by the refresh call itself to avoid recursion. */
  skipAuthRetry?: boolean
  /** Max retry attempts for network/5xx errors. Mutations should usually pass 0. */
  retries?: number
}

/**
 * A `RefreshHandler` is injected at app bootstrap (see modules/auth) rather
 * than imported directly — apiClient is used *by* the auth strategy to call
 * `/auth/refresh`, so importing the auth module here would be circular.
 * Concurrent 401s all await the same in-flight refresh instead of each
 * firing their own (`refreshPromise` below is the single-flight guard).
 */
type RefreshHandler = () => Promise<string | null>
let refreshHandler: RefreshHandler | null = null
let refreshPromise: Promise<string | null> | null = null

export function registerRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler
}

function correlationId(): string {
  return crypto.randomUUID()
}

async function runRefresh(): Promise<string | null> {
  if (!refreshHandler) return null
  if (!refreshPromise) {
    refreshPromise = refreshHandler().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

function shouldRetry(attempt: number, maxRetries: number, err: unknown): boolean {
  if (attempt >= maxRetries) return false
  if (err instanceof ApiError) return err.retryable
  return isNetworkError(err)
}

function backoffMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 200
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function rawRequest<T>(path: string, options: ApiRequestOptions, requestId: string): Promise<T> {
  // skipAuthRetry/retries are read directly off `options` by apiRequest() below — fetch() ignores unrecognized
  // properties on the init object at runtime, so they're harmlessly left in `...init` rather than re-destructured here.
  const { idempotencyKey, headers, ...init } = options
  const token = getAccessToken()

  const res = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...headers,
    },
  })

  const envelope = await res.json().catch(() => null)

  if (!res.ok || !envelope?.success) {
    const err = envelope?.error
    throw new ApiError(
      err?.code ?? 'INTERNAL_ERROR',
      res.status,
      err?.message ?? 'Request failed',
      err?.details,
      err?.retryable ?? false,
    )
  }

  return envelope.data as T
}

/**
 * The full-featured client (query-key based modules use this; `shared/lib/http.ts`'s
 * simpler `apiFetch` stays as-is for the auth module, which can't depend on
 * this file's refresh queue since it *is* the refresh queue's dependency).
 * Handles: correlation IDs, single-flight token refresh + one retry on 401,
 * exponential-backoff retry for network/5xx, request cancellation via the
 * caller's own AbortSignal (passed straight through in `options.signal`).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const requestId = correlationId()
  const maxRetries = options.retries ?? (options.method && options.method !== 'GET' ? 0 : 2)
  let attempt = 0

  for (;;) {
    try {
      return await rawRequest<T>(path, options, requestId)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && !options.skipAuthRetry) {
        const newToken = await runRefresh()
        if (newToken) {
          return rawRequest<T>(path, { ...options, skipAuthRetry: true }, requestId)
        }
      }

      if (shouldRetry(attempt, maxRetries, err)) {
        logger.warn('api.retry', { path, requestId, attempt })
        await sleep(backoffMs(attempt))
        attempt += 1
        continue
      }

      logger.error('api.error', { path, requestId, error: err instanceof Error ? err.message : String(err) })
      throw err
    }
  }
}
