import type { Server } from 'node:http'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { connectDatabase, disconnectDatabase } from './config/db'
import { printStartupBanner } from './shared/utils/startupBanner'
import { connectRedis, disconnectRedis } from './config/redis'

async function main() {
  const mongoose = await connectDatabase()
  await connectRedis()

  const app = createApp()
  const server: Server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'AgriDealer API listening')
    printStartupBanner({ port: env.PORT, mongoConnection: mongoose.connection })
  })

  // Workers are drained gracefully so an in-flight request/job is completed
  // or returned, never lost (docs §15.3).
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully')
    server.close(async () => {
      await disconnectDatabase()
      await disconnectRedis()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err)
  process.exit(1)
})
