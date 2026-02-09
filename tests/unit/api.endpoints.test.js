// tests/unit/api.endpoints.test.js
import { describe, it, expect } from 'vitest'

/**
 * Validation functions for API endpoints
 */

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  if (!password || password.length < 8) return false
  return true
}

function validateName(name) {
  return name && name.trim().length > 0
}

function validateSignupRequest(body) {
  const errors = []

  if (!body.email || !validateEmail(body.email)) {
    errors.push('Invalid email format')
  }

  if (!body.password || !validatePassword(body.password)) {
    errors.push('Password must be at least 8 characters')
  }

  if (!body.name || !validateName(body.name)) {
    errors.push('Name is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function validateSigninRequest(body) {
  const errors = []

  if (!body.email || !validateEmail(body.email)) {
    errors.push('Invalid email format')
  }

  if (!body.password) {
    errors.push('Password is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function validateCodeRequest(body) {
  const errors = []

  if (!body.email || !validateEmail(body.email)) {
    errors.push('Invalid email format')
  }

  if (!body.code || !/^\d{6}$/.test(body.code)) {
    errors.push('Code must be 6 digits')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

describe('API Endpoint Validation', () => {
  describe('POST /api/auth/signup', () => {
    it('should accept valid signup request', () => {
      const request = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const validation = validateSignupRequest(request)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid email', () => {
      const request = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      }

      const validation = validateSignupRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Invalid email format')
    })

    it('should reject short password', () => {
      const request = {
        email: 'user@example.com',
        password: 'short',
        name: 'Test User'
      }

      const validation = validateSignupRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Password must be at least 8 characters')
    })

    it('should reject empty name', () => {
      const request = {
        email: 'user@example.com',
        password: 'password123',
        name: ''
      }

      const validation = validateSignupRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Name is required')
    })

    it('should report all validation errors', () => {
      const request = {
        email: 'invalid',
        password: 'short',
        name: ''
      }

      const validation = validateSignupRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(3)
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should accept valid signin request', () => {
      const request = {
        email: 'user@example.com',
        password: 'password123'
      }

      const validation = validateSigninRequest(request)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid email', () => {
      const request = {
        email: 'not-an-email',
        password: 'password123'
      }

      const validation = validateSigninRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Invalid email format')
    })

    it('should require password', () => {
      const request = {
        email: 'user@example.com',
        password: null
      }

      const validation = validateSigninRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Password is required')
    })
  })

  describe('POST /api/auth/verify-code', () => {
    it('should accept valid code verification request', () => {
      const request = {
        email: 'user@example.com',
        code: '123456'
      }

      const validation = validateCodeRequest(request)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid code format', () => {
      const request = {
        email: 'user@example.com',
        code: 'invalid'
      }

      const validation = validateCodeRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Code must be 6 digits')
    })

    it('should reject code with less than 6 digits', () => {
      const request = {
        email: 'user@example.com',
        code: '12345'
      }

      const validation = validateCodeRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Code must be 6 digits')
    })

    it('should reject code with more than 6 digits', () => {
      const request = {
        email: 'user@example.com',
        code: '1234567'
      }

      const validation = validateCodeRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Code must be 6 digits')
    })

    it('should reject invalid email', () => {
      const request = {
        email: 'invalid-email',
        code: '123456'
      }

      const validation = validateCodeRequest(request)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Invalid email format')
    })
  })
})
