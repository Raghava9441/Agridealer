import argon2 from 'argon2'
import type { CreateUserInput, UpdateUserInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { UserRepository, UserListFilter } from './users.repository'
import type { IUser } from './users.model'

export interface UserUpdateResult {
  before: Pick<IUser, 'role' | 'status'>
  after: IUser
}

export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async createStaff(input: CreateUserInput): Promise<IUser> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) {
      throw new AppError('VALIDATION_FAILED', { email: 'already registered' })
    }

    const passwordHash = await argon2.hash(input.password)
    return this.userRepo.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
    })
  }

  list(filter: UserListFilter = {}) {
    return this.userRepo.list(filter)
  }

  /**
   * Role/status only, and never on your own account (`actingUserId === id`) —
   * self-service profile editing is a different concern, and letting the
   * only owner accidentally demote or disable themselves with no one else
   * around to undo it is exactly the kind of lockout this guards against.
   */
  async update(id: string, actingUserId: string, input: UpdateUserInput): Promise<UserUpdateResult> {
    if (id === actingUserId) {
      throw new AppError('VALIDATION_FAILED', { id: 'cannot change your own role or status' })
    }

    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new AppError('NOT_FOUND', { id })
    }

    const before = { role: user.role, status: user.status }

    Object.assign(user, input)
    await user.save()

    // A role/status change should invalidate every access token already
    // issued with the old role baked into its claims — see the KNOWN GAP
    // note in middleware/authenticate.ts: tokenVersion is bumped here, but
    // nothing yet checks it against a live token's claim, so an already-issued
    // token still carries the old role until it naturally expires
    // (ACCESS_TOKEN_TTL). This is still correct to do now: it's a no-op cost
    // today and the fix that closes the gap only has to check a value that's
    // already being maintained correctly.
    if (input.role && input.role !== before.role) {
      await this.userRepo.incrementTokenVersion(id)
    }

    return { before, after: user }
  }
}
