import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(25),
  sort: z.string().optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
