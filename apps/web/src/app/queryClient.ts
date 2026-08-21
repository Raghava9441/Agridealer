import { QueryClient } from '@tanstack/react-query'

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && err.message.includes('fetch')
}

function isServerError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && Number(err.status) >= 500
}

/**
 * Defaults tuned for a counter-speed ERP, not a generic app (docs §5.3.1).
 * Per-query staleTime overrides live in each feature's query options
 * factory — see docs §5.3.1 table (stock levels: 0, catalogue: 10m, etc).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      retry: (count, err) => isNetworkError(err) && count < 3,
      refetchOnWindowFocus: true,
      throwOnError: (err) => isServerError(err),
    },
    mutations: {
      retry: 0,
    },
  },
})
