import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Provider as ReduxProvider } from 'react-redux'
import { queryClient } from './queryClient'
import { router } from './router'
import { store } from '@/store'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { I18nSync } from '@/shared/i18n/I18nSync'
import '@/shared/i18n'

export function AppProviders() {
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
