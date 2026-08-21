import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { authReducer } from './slices/authSlice'
import { tenantReducer } from './slices/tenantSlice'
import { themeReducer } from './slices/themeSlice'
import { layoutReducer } from './slices/layoutSlice'
import { preferencesReducer } from './slices/preferencesSlice'
import { notificationsReducer } from './slices/notificationsSlice'
import { uiReducer } from './slices/uiSlice'
import { featureFlagsReducer } from './slices/featureFlagsSlice'
import { permissionsReducer } from './slices/permissionsSlice'

const rootReducer = {
  auth: authReducer,
  tenant: tenantReducer,
  theme: themeReducer,
  layout: layoutReducer,
  preferences: preferencesReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  featureFlags: featureFlagsReducer,
  permissions: permissionsReducer,
}

/**
 * Redux Toolkit owns exactly the 9 global-client-state domains named in the
 * architecture spec: auth, tenant, theme, layout, preferences,
 * notifications, ui, featureFlags, permissions. Every other piece of state
 * in this app — customers, invoices, stock, anything that came from the API
 * — lives in TanStack Query, never here, so there is never a second source
 * of truth to keep in sync.
 */
export const store = configureStore({ reducer: rootReducer })

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/** Exported so tests can spin up an isolated store per render instead of sharing the singleton above (see shared/testing/renderWithProviders.tsx). */
export function createAppStore() {
  return configureStore({ reducer: rootReducer })
}

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
