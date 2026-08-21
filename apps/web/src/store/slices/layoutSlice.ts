import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Breadcrumb {
  label: string
  href?: string
}

export interface LayoutState {
  sidebarCollapsed: boolean
  breadcrumbs: Breadcrumb[]
}

const initialState: LayoutState = { sidebarCollapsed: false, breadcrumbs: [] }

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    sidebarCollapsedSet(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    breadcrumbsSet(state, action: PayloadAction<Breadcrumb[]>) {
      state.breadcrumbs = action.payload
    },
  },
})

export const { sidebarToggled, sidebarCollapsedSet, breadcrumbsSet } = layoutSlice.actions
export const layoutReducer = layoutSlice.reducer
export const selectLayout = (state: { layout: LayoutState }) => state.layout
