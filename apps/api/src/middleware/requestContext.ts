import { randomUUID } from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { Role } from '@agridealer/contracts'

export interface RequestContext {
  requestId: string
  tenantId?: string
  userId?: string
  role?: Role
}

/**
 * Request-scoped context threaded through the async call chain without
 * controllers/services passing it explicitly (docs §Request lifecycle).
 * tenantResolver / authenticate populate tenantId/userId/role once the
 * token is verified; repositories and audit read from this store.
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContext>()

export function getRequestContext(): RequestContext {
  const store = requestContextStorage.getStore()
  if (!store) {
    throw new Error('getRequestContext() called outside of a request lifecycle')
  }
  return store
}

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string
  }
}

export const requestContext: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string | undefined) || randomUUID()
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)

  requestContextStorage.run({ requestId }, () => next())
}
