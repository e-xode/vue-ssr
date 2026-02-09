// tests/fixtures/mockData.js

export const mockUser = {
  _id: 'user-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockSecurityCode = {
  code: '123456',
  hash: 'hashed-code-123'
}

export const mockRequest = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
}

export const mockSession = {
  id: 'session-123',
  userId: 'user-123',
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}

export const mockError = new Error('Test error')
