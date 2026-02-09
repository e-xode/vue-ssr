// tests/unit/shared.email.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSecurityCode, hashCode } from '#src/shared/email'

describe('shared/email.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSecurityCode', () => {
    it('should generate a 6-digit security code', async () => {
      const code = await generateSecurityCode()

      expect(code).toBeDefined()
      expect(code).toHaveLength(6)
      expect(/^\d{6}$/.test(code)).toBe(true)
    })

    it('should generate different codes on each call', async () => {
      const code1 = await generateSecurityCode()
      const code2 = await generateSecurityCode()

      expect(code1).not.toEqual(code2)
    })

    it('should always be numeric only', async () => {
      for (let i = 0; i < 5; i++) {
        const code = await generateSecurityCode()
        expect(/^\d{6}$/.test(code)).toBe(true)
      }
    })
  })

  describe('hashCode', () => {
    it('should hash a security code', () => {
      const code = '123456'
      const hash = hashCode(code)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).not.toEqual(code)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should produce consistent hash for same code', () => {
      const code = '123456'
      const hash1 = hashCode(code)
      const hash2 = hashCode(code)

      expect(hash1).toEqual(hash2)
    })

    it('should produce different hash for different codes', () => {
      const hash1 = hashCode('123456')
      const hash2 = hashCode('654321')

      expect(hash1).not.toEqual(hash2)
    })

    it('should handle empty strings', () => {
      const hash = hashCode('')
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
    })
  })
})
