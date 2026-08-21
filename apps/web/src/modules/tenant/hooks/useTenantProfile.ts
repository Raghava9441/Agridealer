import { useQuery } from '@tanstack/react-query'
import { tenantApi, tenantKeys } from '../api/tenantApi'

export function useTenantProfile() {
  return useQuery({
    queryKey: tenantKeys.profile,
    queryFn: tenantApi.getProfile,
  })
}
