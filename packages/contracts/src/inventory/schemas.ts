import { z } from 'zod'

export const expiringBatchesQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
})
export type ExpiringBatchesQuery = z.infer<typeof expiringBatchesQuerySchema>
