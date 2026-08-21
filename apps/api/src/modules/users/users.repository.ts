import { User, type IUser } from './users.model'

export interface TenantContext {
  tenantId: string
}

/**
 * All database access for users is scoped to the caller's tenant (docs §6.5).
 * No service or controller constructs a Mongoose query against User directly.
 */
export class UserRepository {
  constructor(private readonly ctx: TenantContext) {}

  private scope<T extends object>(filter: T) {
    return { ...filter, tenantId: this.ctx.tenantId }
  }

  findByEmail(email: string, withSecrets = false) {
    const query = User.findOne(this.scope({ email: email.toLowerCase() }))
    return withSecrets ? query.select('+mfaSecret') : query
  }

  findById(id: string) {
    return User.findOne(this.scope({ _id: id }))
  }

  create(input: Partial<IUser>) {
    return User.create({ ...input, tenantId: this.ctx.tenantId })
  }

  incrementTokenVersion(id: string) {
    return User.updateOne(this.scope({ _id: id }), { $inc: { tokenVersion: 1 } })
  }
}
