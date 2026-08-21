import { getAccessToken } from './authToken'

// Mirrors bootstrap/config.ts's resolveApiBaseUrl() — duplicated (not
// imported) to avoid a circular import with the auth module. Keep in sync.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT ?? '8080'}/api/v1`

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown
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

interface ApiFetchOptions extends RequestInit {
  idempotencyKey?: string
}

/**
 * Thin fetch wrapper that unwraps the {success,data,error} envelope
 * (docs §8.2) and always sends the refresh cookie via credentials:
 * 'include'. Money-moving mutations pass idempotencyKey (docs §8.6).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { idempotencyKey, headers, ...init } = options
  const token = getAccessToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
