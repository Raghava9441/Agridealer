/**
 * Parses a single-level subdomain label off `hostname` (e.g. "demo-a" from
 * "demo-a.agridealer.app"). Mirrors extractSlug in
 * apps/api/src/middleware/subdomainResolver.ts — keep the two in sync.
 * Bare root domain, "www", or a multi-level subdomain all resolve to null.
 */
export function getTenantSlugFromHostname(hostname: string, rootDomain: string): string | null {
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) return null
  const suffix = `.${rootDomain}`
  if (!hostname.endsWith(suffix)) return null
  const label = hostname.slice(0, -suffix.length)
  if (!label || label.includes('.')) return null
  return label
}
