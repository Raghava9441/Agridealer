import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { isRetryableError, type ErrorCode } from '@agridealer/contracts'
import { isAppError } from '../shared/errors/AppError'
import { logger } from '../config/logger'

function nowIso(): string {
  return new Date().toISOString()
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}`, retryable: false },
    meta: { requestId: req.requestId, timestamp: nowIso() },
  })
}

/**
 * Last middleware in the chain (docs §6.3, §6.9). Maps AppError / ZodError
 * to the standard envelope; anything else is logged with full detail and
 * returned to the client as an opaque INTERNAL_ERROR. This is the single
 * place any error response is built — controllers never hand-roll one, so
 * `retryable`/`timestamp` can't be forgotten on a new endpoint.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (isAppError(err)) {
    res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        retryable: isRetryableError(err.code as ErrorCode),
      },
      meta: { requestId: req.requestId, timestamp: nowIso() },
    })
    return
  }

  if (err instanceof ZodError) {
    const fields = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }))

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Field-level validation failed',
        details: { fields },
        retryable: false,
      },
      meta: { requestId: req.requestId, timestamp: nowIso() },
    })
    return
  }

  logger.error({ err, requestId: req.requestId }, 'Unhandled error')
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      retryable: isRetryableError('INTERNAL_ERROR'),
    },
    meta: { requestId: req.requestId, timestamp: nowIso() },
  })
}
