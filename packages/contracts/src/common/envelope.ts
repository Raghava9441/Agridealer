import { z } from 'zod'

/**
 * Response envelope shape used by every API endpoint (see docs §8.2).
 * Clients switch on `error.code`, never on `error.message`.
 */

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export const responseMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string().datetime(),
  pagination: paginationMetaSchema.optional(),
})

export type ResponseMeta = z.infer<typeof responseMetaSchema>

/** Normalized shape for VALIDATION_FAILED's `details` — one entry per failing field. */
export const validationFieldErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
})
export type ValidationFieldError = z.infer<typeof validationFieldErrorSchema>

export interface SuccessEnvelope<T> {
  success: true
  data: T
  meta: ResponseMeta
}

export interface ErrorEnvelope {
  success: false
  error: {
    code: string
    message: string
    /** Whether the client can safely retry this exact request unchanged. */
    retryable: boolean
    details?: unknown
  }
  meta: ResponseMeta
}

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope
