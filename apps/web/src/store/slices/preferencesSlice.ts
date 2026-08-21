import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { appConfig } from '@/bootstrap/config'
import { applyDocumentDirection } from '@/shared/i18n/rtl'

export type TableDensity = 'comfortable' | 'compact'

export interface PreferencesState {
  locale: string
  tableDensity: TableDensity
}

const STORAGE_KEY = 'agridealer:preferences'

function readStored(): PreferencesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error('no stored preferences')
    return JSON.parse(raw) as PreferencesState
  } catch {
    return { locale: appConfig.defaultLocale, tableDensity: 'comfortable' }
  }
}

const initialState: PreferencesState = readStored()
// Applied synchronously here (module load, before React renders) rather
// than only in I18nSync's useEffect, so a stored Arabic preference doesn't
// flash left-to-right for a frame on first paint.
applyDocumentDirection(initialState.locale)

function persist(state: PreferencesState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    localeSet(state, action: PayloadAction<string>) {
      state.locale = action.payload
      persist(state)
    },
    tableDensitySet(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload
      persist(state)
    },
  },
})

export const { localeSet, tableDensitySet } = preferencesSlice.actions
export const preferencesReducer = preferencesSlice.reducer
export const selectPreferences = (state: { preferences: PreferencesState }) => state.preferences
