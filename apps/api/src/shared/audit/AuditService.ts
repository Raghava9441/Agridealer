import type { ClientSession } from 'mongoose'
import { AuditLog } from '../../modules/audit/audit.model'
import type { AccessTokenClaims } from '@agridealer/contracts'

export interface AuditWriteInput {
  actor: AccessTokenClaims & { name?: string }
  action: string
  entity: { type: string; id: string }
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  context: { ip?: string; userAgent?: string; requestId: string }
}

/**
 * Writes the immutable audit document (docs §6.2, §7.3.5, §11.5). Called
 * inside the same transaction as the change it records, so an action
 * cannot succeed without leaving a trace.
 */
export class AuditService {
  async record(input: AuditWriteInput, session?: ClientSession): Promise<void> {
    await AuditLog.create(
      [
        {
          tenantId: input.actor.tenantId,
          actor: {
            userId: input.actor.userId,
            name: input.actor.name ?? input.actor.userId,
            role: input.actor.role,
          },
          action: input.action,
          entity: input.entity,
          before: input.before,
          after: input.after,
          context: input.context,
          performedAt: new Date(),
        },
      ],
      { session },
    )
  }
}

export const auditService = new AuditService()
