import { Schema, model, type Document } from 'mongoose'

/**
 * Append-only audit trail (docs §7.3.5). No update or delete path exists
 * on this model by design — immutability is enforced here, and again at
 * the database privilege level in real environments.
 */
export interface IAuditLog extends Document {
  tenantId: string
  actor: { userId: string; name: string; role: string }
  action: string
  entity: { type: string; id: string }
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  context: { ip?: string; userAgent?: string; requestId: string }
  performedAt: Date
}

const auditLogSchema = new Schema<IAuditLog>({
  tenantId: { type: String, required: true, index: true },
  actor: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  action: { type: String, required: true },
  entity: {
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  context: {
    ip: String,
    userAgent: String,
    requestId: { type: String, required: true },
  },
  performedAt: { type: Date, required: true, default: Date.now },
})

auditLogSchema.index({ tenantId: 1, performedAt: -1 })

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema)
