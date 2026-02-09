// tests/setup.js
import { vi } from 'vitest'

// Mock process.env for tests
process.env.NODE_ENV = 'test'
process.env.NODE_HOST = 'http://localhost:5173'
process.env.MAILER_HOST = 'smtp.test.com'
process.env.MAILER_FROM = 'test@example.com'
process.env.MAILER_LOGIN = 'test@example.com'
process.env.MAILER_PASSWORD = 'test-password'
process.env.MAILER_PORT = '587'
process.env.MAILER_SSL = 'false'
process.env.MONGO_DB = 'test'
process.env.MONGO_HOST = 'localhost:27017'
process.env.MONGO_USER = 'test'
process.env.MONGO_PWD = 'test'
process.env.MONGO_TYPE = 'mongodb'
process.env.COOKIE_SECRET = 'test-secret-key'

// Global mocks
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}
