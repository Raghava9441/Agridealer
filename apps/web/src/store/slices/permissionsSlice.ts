import { createSlice } from '@reduxjs/toolkit'
import { PERMISSIONS, roleHasPermission, type Permission } from '@agridealer/contracts'
import { login, restoreSession, logout } from './authSlice'

export interface PermissionsState {
  granted: Permission[]
}

const initialState: PermissionsState = { granted: [] }

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.granted = []
      })
      .addMatcher(
        (action): action is ReturnType<typeof login.fulfilled> | ReturnType<typeof restoreSession.fulfilled> =>
          action.type === login.fulfilled.type || action.type === restoreSession.fulfilled.type,
        (state, action) => {
          const session = action.payload
          state.granted = session ? PERMISSIONS.filter((p) => roleHasPermission(session.role, p)) : []
        },
      )
  },
})

export const permissionsReducer = permissionsSlice.reducer

export const selectGrantedPermissions = (state: { permissions: PermissionsState }) => state.permissions.granted
export const selectHasPermission =
  (permission: Permission) =>
  (state: { permissions: PermissionsState }): boolean =>
    state.permissions.granted.includes(permission)
