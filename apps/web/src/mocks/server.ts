import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Node-side MSW server for Vitest — started/reset/closed from setupTests.ts. */
export const server = setupServer(...handlers)
