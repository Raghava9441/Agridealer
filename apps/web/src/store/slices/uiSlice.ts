import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
  commandPaletteOpen: boolean
  activeModal: string | null
}

const initialState: UiState = { commandPaletteOpen: false, activeModal: null }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    commandPaletteToggled(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen
    },
    commandPaletteSet(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload
    },
    modalOpened(state, action: PayloadAction<string>) {
      state.activeModal = action.payload
    },
    modalClosed(state) {
      state.activeModal = null
    },
  },
})

export const { commandPaletteToggled, commandPaletteSet, modalOpened, modalClosed } = uiSlice.actions
export const uiReducer = uiSlice.reducer
export const selectUi = (state: { ui: UiState }) => state.ui
