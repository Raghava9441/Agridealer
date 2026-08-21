/**
 * Single place that reads `import.meta.env` — every other module reads
 * typed config from here, never `import.meta.env` directly, so there's one
 * place to audit when an env var is added/renamed and one place to default
 * it safely for tests (Vitest doesn't populate Vite env vars the same way).
 */
export interface AppConfig {
  apiBaseUrl: string
  rootDomain: string
  appName: string
  environment: 'development' | 'production' | 'test'
  defaultLocale: string
  supportedLocales: readonly string[]
  /** Unset in dev/most deploys — Sentry (src/monitoring/sentry.ts) stays inert without it. */
  sentryDsn: string | undefined
}

/**
 * Prod sets VITE_API_BASE_URL to a fixed API host and it's used as-is —
 * that single host works fine across every tenant subdomain since the
 * refresh cookie is host-only, not tenant-scoped by the browser. Dev
 * leaves it unset and derives the API origin from the current page's
 * hostname (same host as the frontend, different port), so a request from
 * demo-a.localhost:5173 goes to demo-a.localhost:8080 — same host, so the
 * cookie set by the API is sent back without needing a Domain attribute.
 */
function resolveApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL
  if (explicit) return explicit

  const port = import.meta.env.VITE_API_PORT ?? '8080'
  return `${window.location.protocol}//${window.location.hostname}:${port}/api/v1`
}

export const appConfig: AppConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  rootDomain: import.meta.env.VITE_ROOT_DOMAIN ?? 'localhost',
  appName: 'AgriDealer ERP',
  environment: (import.meta.env.MODE as AppConfig['environment']) ?? 'development',
  defaultLocale: 'en',
  supportedLocales: ['en', 'te', 'hi'],
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
}
