// tests/unit/shared.log.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logInfo, logWarn, logError, logDebug } from '#src/shared/log'

describe('shared/log.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logInfo', () => {
    it('should log info message with timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      logInfo('Test info message')

      expect(consoleSpy).toHaveBeenCalled()
      const call = consoleSpy.mock.calls[0][0]
      expect(call).toContain('Test info message')
      expect(call).toContain('ℹ')

      consoleSpy.mockRestore()
    })

    it('should handle multiple info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      logInfo('Message 1')
      logInfo('Message 2')

      expect(consoleSpy).toHaveBeenCalledTimes(2)

      consoleSpy.mockRestore()
    })
  })

  describe('logWarn', () => {
    it('should log warning message with warning icon', () => {
      const consoleSpy = vi.spyOn(console, 'warn')

      logWarn('Test warning message')

      expect(consoleSpy).toHaveBeenCalled()
      const call = consoleSpy.mock.calls[0][0]
      expect(call).toContain('Test warning message')
      expect(call).toContain('⚠')

      consoleSpy.mockRestore()
    })
  })

  describe('logError', () => {
    it('should log error message with error icon', () => {
      const consoleSpy = vi.spyOn(console, 'error')

      logError('Test error message')

      expect(consoleSpy).toHaveBeenCalled()
      const call = consoleSpy.mock.calls[0][0]
      expect(call).toContain('Test error message')
      expect(call).toContain('✗')

      consoleSpy.mockRestore()
    })
  })

  describe('logDebug', () => {
    it('should log debug message with debug icon', () => {
      const consoleSpy = vi.spyOn(console, 'debug')

      logDebug('Test debug message')

      expect(consoleSpy).toHaveBeenCalled()
      const call = consoleSpy.mock.calls[0][0]
      expect(call).toContain('Test debug message')
      expect(call).toContain('🐛')

      consoleSpy.mockRestore()
    })
  })
})
