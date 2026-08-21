import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { login, restoreSession } from './authSlice'

export interface FeatureFlagsState {
  /** From `tenant.features` (real field on `/auth/me`) — the actual source of truth. */
  resolved: string[]
  /** Dev-only local overrides, e.g. to preview a flag before the backend tenant has it. Never sent to the server. */
  overrides: Record<string, boolean>
}

const OVERRIDES_STORAGE_KEY = 'agridealer:feature-flag-overrides'

function readOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

const initialState: FeatureFlagsState = { resolved: [], overrides: readOverrides() }

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    overrideSet(state, action: PayloadAction<{ key: string; value: boolean }>) {
      state.overrides[action.payload.key] = action.payload.value
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(state.overrides))
    },
    overrideCleared(state, action: PayloadAction<string>) {
      delete state.overrides[action.payload]
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(state.overrides))
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is ReturnType<typeof login.fulfilled> | ReturnType<typeof restoreSession.fulfilled> =>
        action.type === login.fulfilled.type || action.type === restoreSession.fulfilled.type,
      (state, action) => {
        state.resolved = action.payload?.tenant.features ?? []
      },
    )
  },
})

export const { overrideSet, overrideCleared } = featureFlagsSlice.actions
export const featureFlagsReducer = featureFlagsSlice.reducer

export const selectFeatureFlag =
  (key: string) =>
  (state: { featureFlags: FeatureFlagsState }): boolean =>
    state.featureFlags.overrides[key] ?? state.featureFlags.resolved.includes(key)
