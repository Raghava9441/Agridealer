import type { Connection } from 'mongoose'
import { env } from '../../config/env'

const READY_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

// eslint-disable-next-line no-control-regex -- \x1b is the ANSI escape char, needed to measure visible (non-escape-code) text width
const ANSI = /\x1b\[[0-9;]*m/g
const color = (code: string, text: string) => `\x1b[${code}m${text}\x1b[0m`
const bold = (t: string) => color('1', t)
const dim = (t: string) => color('2', t)
const cyan = (t: string) => color('36', t)
const green = (t: string) => color('32', t)
const yellow = (t: string) => color('33', t)
const red = (t: string) => color('31', t)

function visibleLength(text: string): number {
  return text.replace(ANSI, '').length
}

function row(label: string, value: string): string {
  return `  ${cyan(label.padEnd(10))} ${value}`
}

interface BannerInfo {
  port: number
  mongoConnection: Connection
}

/**
 * Human-readable dev-console summary, printed once the server is listening
 * and Mongo has connected. This is deliberately separate from the pino JSON
 * log stream (docs §6.2 requires structured logs for aggregation) — it's a
 * local-dev readability aid only, so it's gated to NODE_ENV=development and
 * never runs in production.
 */
export function printStartupBanner({ port, mongoConnection }: BannerInfo): void {
  if (env.NODE_ENV !== 'development') return

  const mongoState = mongoConnection.readyState
  const mongoLabel = READY_STATES[mongoState] ?? 'unknown'
  const mongoDot = mongoState === 1 ? green('●') : mongoState === 2 ? yellow('●') : red('●')

  const lines = [
    bold(green('  AgriDealer ERP API  ')),
    '',
    row('Env', env.NODE_ENV),
    row('Server', `http://localhost:${port}`),
    row('API base', `http://localhost:${port}/api/v1`),
    row('Node', `${process.version} (pid ${process.pid})`),
    '',
    row('MongoDB', `${mongoDot} ${mongoLabel}`),
    row('  host', mongoConnection.host ?? dim('n/a')),
    row('  database', mongoConnection.name ?? dim('n/a')),
    '',
    dim(`  ${new Date().toLocaleString()}`),
  ]

  const width = Math.max(...lines.map(visibleLength)) + 2
  const top = `  ┌${'─'.repeat(width)}┐`
  const bottom = `  └${'─'.repeat(width)}┘`
  const body = lines.map((line) => `  │ ${line}${' '.repeat(width - visibleLength(line) - 1)}│`)

  // eslint-disable-next-line no-console
  console.log(['', top, ...body, bottom, ''].join('\n'))
}
