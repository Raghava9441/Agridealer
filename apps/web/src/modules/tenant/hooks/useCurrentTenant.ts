import { useQuery } from '@tanstack/react-query'
import { tenantApi, tenantKeys } from '../api/tenantApi'

/** Used on the public login shell for branding + a "store not found" screen on a bad subdomain. */
export function useCurrentTenant() {
  return useQuery({
    queryKey: tenantKeys.current,
    queryFn: tenantApi.current,
    retry: false,
  })
}
