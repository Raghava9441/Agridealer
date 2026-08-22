import { useQuery } from '@tanstack/react-query'
import { productsApi, productsKeys } from '../api/productsApi'

/**
 * For the catalog management table (ProductTable) — unlike useProducts
 * (PosScreen's fast lookup, gated on `enabled: search.length > 0` so it
 * doesn't fetch until the operator types), this always fetches: a catalog
 * screen should show the whole list by default, with search narrowing it.
 */
export function useProductsList(search = '') {
  return useQuery({
    queryKey: productsKeys.list({ search: search || undefined }),
    queryFn: () => productsApi.list({ search: search || undefined }),
  })
}
