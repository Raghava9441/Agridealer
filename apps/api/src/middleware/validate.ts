import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodTypeAny } from 'zod'

interface ValidateSchemas {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

/**
 * Validates request body/query/params against Zod schemas before any
 * business logic runs (docs §3.3, §11.4). Failures throw a ZodError,
 * which errorHandler turns into a 422 VALIDATION_FAILED response.
 */
export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body)
    if (schemas.query) req.query = schemas.query.parse(req.query)
    if (schemas.params) req.params = schemas.params.parse(req.params)
    next()
  }
}
