// tests/unit/api.utils.test.js
import { describe, it, expect } from 'vitest'

/**
 * Parse API error response
 */
function parseApiError(response) {
  if (!response) return 'Unknown error'

  if (typeof response === 'string') return response

  if (response.error) return response.error
  if (response.message) return response.message

  return 'Unknown error'
}

/**
 * Format API request body
 */
function formatRequestBody(data) {
  return {
    ...data,
    timestamp: new Date().toISOString()
  }
}

/**
 * Check if response is successful
 */
function isSuccessResponse(response) {
  if (!response) return false
  return response.status >= 200 && response.status < 300
}

describe('API Utilities', () => {
  describe('parseApiError', () => {
    it('should parse error from string', () => {
      const error = parseApiError('Invalid email')
      expect(error).toBe('Invalid email')
    })

    it('should parse error from object with error field', () => {
      const error = parseApiError({ error: 'Email already used' })
      expect(error).toBe('Email already used')
    })

    it('should parse error from object with message field', () => {
      const error = parseApiError({ message: 'Server error' })
      expect(error).toBe('Server error')
    })

    it('should handle null response', () => {
      const error = parseApiError(null)
      expect(error).toBe('Unknown error')
    })

    it('should handle undefined response', () => {
      const error = parseApiError(undefined)
      expect(error).toBe('Unknown error')
    })

    it('should prioritize error field over message field', () => {
      const error = parseApiError({
        error: 'Primary error',
        message: 'Secondary message'
      })
      expect(error).toBe('Primary error')
    })
  })

  describe('formatRequestBody', () => {
    it('should add timestamp to request body', () => {
      const body = { email: 'test@example.com' }
      const formatted = formatRequestBody(body)

      expect(formatted.email).toBe('test@example.com')
      expect(formatted.timestamp).toBeDefined()
    })

    it('should not modify original data', () => {
      const body = { email: 'test@example.com' }
      const originalEmail = body.email

      formatRequestBody(body)

      expect(body.email).toBe(originalEmail)
      expect(body.timestamp).toBeUndefined()
    })

    it('should preserve all fields', () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
      const formatted = formatRequestBody(body)

      expect(formatted.email).toBe('test@example.com')
      expect(formatted.password).toBe('password123')
      expect(formatted.name).toBe('Test User')
    })
  })

  describe('isSuccessResponse', () => {
    it('should return true for 2xx status codes', () => {
      expect(isSuccessResponse({ status: 200 })).toBe(true)
      expect(isSuccessResponse({ status: 201 })).toBe(true)
      expect(isSuccessResponse({ status: 204 })).toBe(true)
      expect(isSuccessResponse({ status: 299 })).toBe(true)
    })

    it('should return false for non-2xx status codes', () => {
      expect(isSuccessResponse({ status: 400 })).toBe(false)
      expect(isSuccessResponse({ status: 401 })).toBe(false)
      expect(isSuccessResponse({ status: 404 })).toBe(false)
      expect(isSuccessResponse({ status: 500 })).toBe(false)
    })

    it('should return false for null response', () => {
      expect(isSuccessResponse(null)).toBe(false)
    })

    it('should return false for undefined response', () => {
      expect(isSuccessResponse(undefined)).toBe(false)
    })
  })
})
