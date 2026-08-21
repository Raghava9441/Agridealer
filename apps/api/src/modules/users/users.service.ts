import argon2 from 'argon2'
import type { CreateUserInput } from '@agridealer/contracts'
import { AppError } from '../../shared/errors/AppError'
import type { UserRepository } from './users.repository'
import type { IUser } from './users.model'

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
}
