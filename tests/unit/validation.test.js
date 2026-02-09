// tests/unit/validation.test.js
import { describe, it, expect } from 'vitest'

/**
 * Email validation function for testing
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation function for testing
 */
function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false
  return password.length >= 8
}

/**
 * Code validation function for testing
 */
function isValidSecurityCode(code) {
  return /^\d{6}$/.test(code)
}

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should accept passwords with 8+ characters', () => {
      expect(isValidPassword('password123')).toBe(true)
      expect(isValidPassword('SecurePass123!')).toBe(true)
      expect(isValidPassword('12345678')).toBe(true)
    })

    it('should reject passwords with less than 8 characters', () => {
      expect(isValidPassword('pass')).toBe(false)
      expect(isValidPassword('1234567')).toBe(false)
      expect(isValidPassword('')).toBe(false)
      expect(isValidPassword(null)).toBe(false)
    })
  })

  describe('isValidSecurityCode', () => {
    it('should accept 6-digit numeric codes', () => {
      expect(isValidSecurityCode('123456')).toBe(true)
      expect(isValidSecurityCode('000000')).toBe(true)
      expect(isValidSecurityCode('999999')).toBe(true)
    })

    it('should reject non-6-digit codes', () => {
      expect(isValidSecurityCode('12345')).toBe(false)
      expect(isValidSecurityCode('1234567')).toBe(false)
      expect(isValidSecurityCode('12345a')).toBe(false)
      expect(isValidSecurityCode('abc123')).toBe(false)
      expect(isValidSecurityCode('')).toBe(false)
    })
  })
})
