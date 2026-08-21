/**
 * Access token lives in memory only, never localStorage (docs §11.1) —
 * the refresh token is what persists, in an httpOnly cookie the JS
 * layer never touches. Split out from the auth feature so shared/lib/http
 * can read it without importing the auth store (avoids a circular import).
 */
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}
