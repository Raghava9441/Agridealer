import { z } from 'zod'
import { ROLES } from './roles'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
export type LoginInput = z.infer<typeof loginSchema>

export const mfaVerifySchema = z.object({
  challengeToken: z.string(),
  code: z.string().length(6),
})
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
})
export type CreateUserInput = z.infer<typeof createUserSchema>

/**
 * Role/status only — not a general profile editor. Name/email/password
 * changes are a different, self-service concern (and email changes would
 * need to re-check the tenant-scoped uniqueness index); this endpoint exists
 * specifically to administer access, matching what users:manage actually
 * gates.
 */
export const updateUserSchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(['active', 'disabled']).optional(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const listUsersQuerySchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(['active', 'disabled']).optional(),
})
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

/** Shape of the verified JWT access token claim (docs §11.1). */
export const accessTokenClaimsSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  role: z.enum(ROLES),
  tokenVersion: z.number().int(),
})
export type AccessTokenClaims = z.infer<typeof accessTokenClaimsSchema>
