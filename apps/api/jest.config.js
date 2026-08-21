/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  setupFiles: ['<rootDir>/../jest.setup.js'],
  // Importing app.ts constructs the Redis-backed rate limiters at module
  // load time; ioredis's default retry loop keeps a timer alive against an
  // unreachable Redis in tests, so Jest never exits on its own without this.
  forceExit: true,
}
