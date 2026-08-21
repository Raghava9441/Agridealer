import type { Request, Response } from 'express'
import type { PaginationMeta } from '@agridealer/contracts'

export interface SendSuccessOptions {
  status?: number
  pagination?: PaginationMeta
}

/**
 * The one place a success envelope is built (docs §8.2) — guarantees
 * `meta.requestId`/`meta.timestamp` are always present instead of relying
 * on every controller to hand-roll them correctly.
 */
export function sendSuccess<T>(req: Request, res: Response, data: T, opts: SendSuccessOptions = {}): void {
  res.status(opts.status ?? 200).json({
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      ...(opts.pagination ? { pagination: opts.pagination } : {}),
    },
  })
}
