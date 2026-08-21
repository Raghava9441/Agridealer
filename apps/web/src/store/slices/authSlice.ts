import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginInput, Role } from '@agridealer/contracts'
import { jwtAuthStrategy } from '@/core/auth/jwtAuthStrategy'
import type { Session } from '@/core/auth/authStrategy'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous'

export interface AuthState {
  session: Session | null
  status: AuthStatus
}

const initialState: AuthState = { session: null, status: 'idle' }

/** Resolves a session from the refresh cookie on page load — the router's `_app` guard awaits this once per app load. */
export const restoreSession = createAsyncThunk('auth/restoreSession', () => jwtAuthStrategy.restoreSession())

export const login = createAsyncThunk('auth/login', (input: LoginInput) => jwtAuthStrategy.login(input))

export const logout = createAsyncThunk('auth/logout', async () => {
  await jwtAuthStrategy.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Escape hatch for tests/mocks — production code should go through the thunks above. */
    sessionSet(state, action: PayloadAction<Session | null>) {
      state.session = action.payload
      state.status = action.payload ? 'authenticated' : 'anonymous'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.session = action.payload
        state.status = action.payload ? 'authenticated' : 'anonymous'
      })
      .addCase(restoreSession.rejected, (state) => {
        state.session = null
        state.status = 'anonymous'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.session = action.payload
        state.status = 'authenticated'
      })
      .addCase(logout.fulfilled, (state) => {
        state.session = null
        state.status = 'anonymous'
      })
  },
})

export const { sessionSet } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectSession = (state: { auth: AuthState }) => state.auth.session
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
export const selectRole = (state: { auth: AuthState }): Role | undefined => state.auth.session?.role
