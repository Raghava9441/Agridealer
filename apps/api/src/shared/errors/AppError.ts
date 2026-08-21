import { ERROR_CODES, type ErrorCode } from '@agridealer/contracts'

/**
 * The one error type services throw (docs §6.9). The error handler
 * middleware is the only place that turns this into an HTTP response,
 * so the wire contract cannot drift between modules.
 */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, details?: unknown, message?: string) {
    super(message ?? code)
    this.name = 'AppError'
    this.code = code
    this.status = ERROR_CODES[code]
    this.details = details
    Error.captureStackTrace?.(this, AppError)
  }

  static fromCode(code: ErrorCode, details?: unknown, message?: string): AppError {
    return new AppError(code, details, message)
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}
