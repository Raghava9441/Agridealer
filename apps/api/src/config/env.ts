import { z } from 'zod'

/**
 * Single source of truth for environment variables (docs §Environment
 * configuration, Appendix §18.1). Fails fast at boot rather than at
 * first use so a missing secret is a startup error, not a 2am incident.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'staging', 'development', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),

  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),

  CORS_ORIGINS: z.string().default(''),
  ROOT_DOMAIN: z.string().default('localhost'),

  IDEMPOTENCY_KEY_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),

  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_WEBHOOK_SECRET: z.string().optional(),

  SMS_PROVIDER_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),
  SMS_DLT_ENTITY_ID: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
    throw new Error('Environment validation failed — see errors above')
  }
  return parsed.data
}

export const env = loadEnv()

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Matches any `https?://<label>.${ROOT_DOMAIN}[:port]` tenant subdomain, single label only. */
const subdomainOriginPattern = new RegExp(
  `^https?://[a-z0-9-]+\\.${escapeRegExp(env.ROOT_DOMAIN)}(:\\d+)?$`,
)

/**
 * CORS origin check (docs §subdomain tenancy). `origin` is `undefined` for
 * non-browser/same-origin requests (curl, server-to-server, seed scripts) —
 * those are always allowed since there's no browser cookie jar to protect.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true
  if (corsOrigins.includes(origin)) return true
  return subdomainOriginPattern.test(origin)
}
