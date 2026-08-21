import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppStore } from '@/store'

/**
 * Fresh Redux store + QueryClient per call — never the app's real
 * singleton `store`, so one test's dispatches/cached queries can't leak
 * into the next.
 */
export function renderWithProviders(ui: ReactElement) {
  const store = createAppStore()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

  return {
    store,
    queryClient,
    ...render(
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </ReduxProvider>,
    ),
  }
}
