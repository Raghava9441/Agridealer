import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'

/**
 * MongoDB replica set connection (docs §7, §12.1). A replica set is
 * required even in local dev because multi-document transactions
 * (invoice + stock + ledger) are not available on a standalone server.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)

  // Every repository's `list()` builds its filter as an object literal with
  // optional keys present-but-`undefined` (e.g. `{search: query.search}`
  // when `query.search` wasn't supplied) — without this, the MongoDB driver
  // serializes those as real query constraints requiring the field to be
  // undefined, which no document satisfies, so every unfiltered "list"
  // silently matches nothing instead of everything.
  const connection = await mongoose.connect(env.MONGODB_URI, { ignoreUndefined: true })
  logger.info({ host: connection.connection.host }, 'MongoDB connected')

  connection.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
  })
  connection.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error')
  })

  return connection
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect()
}
