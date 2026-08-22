import type { CreateUserInput, UpdateUserInput, Role } from '@agridealer/contracts'
import { apiRequest } from '@/core/http/apiClient'
import { buildQueryString } from '@/core/http/buildQueryString'

export interface StaffUser {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface UserListFilter {
  role?: Role
  status?: 'active' | 'disabled'
}

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filter: UserListFilter) => [...usersKeys.lists(), filter] as const,
}

/** Talks to apps/api/src/modules/users/users.routes.ts — every route here is users:manage-only (owner). */
export const usersApi = {
  list(filter: UserListFilter = {}): Promise<StaffUser[]> {
    return apiRequest<StaffUser[]>(`/users${buildQueryString(filter)}`)
  },
  create(input: CreateUserInput): Promise<StaffUser> {
    return apiRequest<StaffUser>('/users', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id: string, input: UpdateUserInput): Promise<StaffUser> {
    return apiRequest<StaffUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
  },
}
