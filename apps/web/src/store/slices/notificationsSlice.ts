import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  variant: ToastVariant
  /** A CMS content key (see cms/), not raw text — see useContent(). */
  messageKey: string
  messageParams?: Record<string, string | number>
}

export interface NotificationsState {
  toasts: Toast[]
}

const initialState: NotificationsState = { toasts: [] }

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toastPushed: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: crypto.randomUUID() } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { toastPushed, toastDismissed } = notificationsSlice.actions
export const notificationsReducer = notificationsSlice.reducer
export const selectToasts = (state: { notifications: NotificationsState }) => state.notifications.toasts
