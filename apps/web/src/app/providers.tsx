import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Provider as ReduxProvider } from 'react-redux'
import { queryClient } from './queryClient'
import { router } from './router'
import { store } from '@/store'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nSync } from '@/shared/i18n/I18nSync'
import { drainSyncQueue } from '@/offline/offlineSync'
import '@/shared/i18n'

export function AppProviders() {
  // Replays anything queued from a previous offline session as soon as we
  // have a connection — once on boot (tab may have been closed offline and
  // reopened online), then again every time the browser regains connectivity.
  useEffect(() => {
    void drainSyncQueue()
    const onOnline = () => void drainSyncQueue()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  return (
    <ReduxProvider store={store}>
      <I18nSync>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </I18nSync>
    </ReduxProvider>
  )
}
