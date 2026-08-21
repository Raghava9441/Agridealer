import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { auditService } from '../shared/audit/AuditService'

/**
 * Declares the audit action for a mutating route (docs §6.3, §11.5), e.g.
 * `router.post('/invoices', ..., auditAction('INVOICE_CREATE'), controller.create)`.
 * Coverage does not depend on the controller remembering to log — it fires
 * on any 2xx response once the handler has set req.auditEntity.
 */
declare module 'express-serve-static-core' {
  interface Request {
    auditEntity?: { type: string; id: string; before?: unknown; after?: unknown }
  }
}

export function auditAction(action: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.auditEntity) {
        auditService
          .record({
            actor: req.user,
            action,
            entity: { type: req.auditEntity.type, id: req.auditEntity.id },
            before: req.auditEntity.before as Record<string, unknown> | undefined,
            after: req.auditEntity.after as Record<string, unknown> | undefined,
            context: { ip: req.ip, userAgent: req.headers['user-agent'], requestId: req.requestId },
          })
          .catch(() => {
            // Audit failures must never break the response already sent to the client;
            // they are logged by the unhandled rejection handler in server.ts.
          })
      }
    })
    next()
  }
}
