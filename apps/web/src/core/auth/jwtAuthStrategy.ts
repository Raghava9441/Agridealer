import type { LoginInput } from '@agridealer/contracts'
import { apiRequest, registerRefreshHandler } from '@/core/http/apiClient'
import { getAccessToken, setAccessToken } from '@/shared/lib/authToken'
import type { AuthStrategy, Session } from './authStrategy'

interface MeResponse extends Session {}

/** The active AuthStrategy — talks to the real /auth/* endpoints (apps/api/src/modules/auth). */
export const jwtAuthStrategy: AuthStrategy = {
  async login(input: LoginInput) {
    const { accessToken } = await apiRequest<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuthRetry: true,
    })
    setAccessToken(accessToken)
    return apiRequest<MeResponse>('/auth/me')
  },

  async logout() {
    await apiRequest<null>('/auth/logout', { method: 'POST', skipAuthRetry: true }).catch(() => {})
    setAccessToken(null)
  },

  async restoreSession() {
    try {
      if (!getAccessToken()) {
        const { accessToken } = await apiRequest<{ accessToken: string }>('/auth/refresh', {
          method: 'POST',
          skipAuthRetry: true,
        })
        setAccessToken(accessToken)
      }
      return await apiRequest<MeResponse>('/auth/me')
    } catch {
      setAccessToken(null)
      return null
    }
  },

  getToken() {
    return getAccessToken()
  },
}

// apiClient's 401 handling calls this to get a fresh token without each caller re-implementing the refresh dance.
registerRefreshHandler(async () => {
  try {
    const { accessToken } = await apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      skipAuthRetry: true,
    })
    setAccessToken(accessToken)
    return accessToken
  } catch {
    setAccessToken(null)
    return null
  }
})
