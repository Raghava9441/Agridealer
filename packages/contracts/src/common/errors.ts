/**
 * Machine-readable error codes (see docs §8.3). SCREAMING_SNAKE_CASE per
 * the naming convention in docs §18.2. HTTP status is fixed per code so
 * services and the client agree on one mapping.
 */
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  MFA_REQUIRED: 401,
  FORBIDDEN: 403,
  FEATURE_NOT_IN_PLAN: 403,
  TENANT_SUSPENDED: 403,
  TENANT_MISMATCH: 403,
  NOT_FOUND: 404,
  TENANT_NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
  EXPIRED_BATCH: 409,
  CREDIT_LIMIT_EXCEEDED: 409,
  DUPLICATE_REQUEST: 409,
  CASHBOOK_CLOSED: 409,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const

export type ErrorCode = keyof typeof ERROR_CODES

/**
 * Explicit opt-in list of codes a client may safely retry unchanged
 * (network-shaped or transient-capacity failures). Everything else
 * defaults to non-retryable — retrying a VALIDATION_FAILED or
 * INSUFFICIENT_STOCK without changing the request just repeats the error.
 */
export const ERROR_RETRYABLE: Partial<Record<ErrorCode, true>> = {
  RATE_LIMITED: true,
  INTERNAL_ERROR: true,
}

export function isRetryableError(code: ErrorCode): boolean {
  return ERROR_RETRYABLE[code] === true
}
