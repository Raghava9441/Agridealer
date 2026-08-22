import type { CreateUserInput, Role } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'

export interface CreatedUser {
  id: string
  name: string
  email: string
  role: Role
}

/**
 * Talks to apps/api/src/modules/users/users.routes.ts — create-only today,
 * that's the entire backend surface (no list/get/update route exists yet).
 */
export const usersApi = {
  create(input: CreateUserInput): Promise<CreatedUser> {
    return apiRequest<CreatedUser>('/users', { method: 'POST', body: JSON.stringify(input) })
  },
}
