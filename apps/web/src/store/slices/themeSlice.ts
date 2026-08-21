import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
  /** Per-tenant brand color override, as an "H S% L%" triplet matching the --color-brand token format in styles/tailwind.css (NOT a hex string — the token is consumed as `hsl(var(--color-brand) / <alpha>)`). Absent today — no backend field for it yet. */
  brandColor: string | null
}

const STORAGE_KEY = 'agridealer:theme-mode'

function readStoredMode(): ThemeMode {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

const initialState: ThemeState = { mode: readStoredMode(), brandColor: null }

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    modeSet(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
      localStorage.setItem(STORAGE_KEY, action.payload)
    },
    brandColorSet(state, action: PayloadAction<string | null>) {
      state.brandColor = action.payload
    },
  },
})

export const { modeSet, brandColorSet } = themeSlice.actions
export const themeReducer = themeSlice.reducer
export const selectTheme = (state: { theme: ThemeState }) => state.theme
