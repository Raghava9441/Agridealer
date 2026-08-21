import type { LoginInput, Role } from '@agridealer/contracts'

export interface Session {
  userId: string
  tenantId: string
  role: Role
  tenant: { plan: string; features: string[]; slug: string; name: string }
}

/**
 * Pluggable auth backend. `JwtAuthStrategy` (jwtAuthStrategy.ts) is the only
 * implementation today — it's what the real API supports (see
 * apps/api/src/modules/auth). An `OidcAuthStrategy`/`MsalAuthStrategy` could
 * implement this same interface later without any consuming code (Redux
 * authSlice thunks, route guards) changing, but isn't built now: there's no
 * Azure AD app registration or IdP to configure it against yet, so
 * installing `@azure/msal-browser` today would be an unusable dependency.
 */
export interface AuthStrategy {
  login(input: LoginInput): Promise<Session>
  logout(): Promise<void>
  /** Resolves a session from the refresh cookie without a fresh login — used on page load. */
  restoreSession(): Promise<Session | null>
  getToken(): string | null
}
