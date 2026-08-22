import { useQuery } from '@tanstack/react-query'
import { vendorsApi, vendorsKeys, type VendorListFilter } from '../api/vendorsApi'

export function useVendors(filter: VendorListFilter = {}) {
  return useQuery({
    queryKey: vendorsKeys.list(filter),
    queryFn: () => vendorsApi.list(filter),
  })
}
