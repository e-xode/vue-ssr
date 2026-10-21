import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logInfo, logWarn, logError, logDebug, logScope } from '#src/shared/log';

describe('shared/log.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('logInfo', () => {
    it('should log info message with an ISO timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logInfo('Test info message');

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Test info message');
      expect(call).toContain('ℹ');
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should handle multiple info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logInfo('Message 1');
      logInfo('Message 2');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('logWarn', () => {
    it('should log warning message with warning icon', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logWarn('Test warning message');

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Test warning message');
      expect(call).toContain('⚠');
    });
  });

  describe('logError', () => {
    it('should log error message with error icon', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logError('Test error message');

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Test error message');
      expect(call).toContain('✗');
    });
  });

  describe('logDebug', () => {
    it('should log debug message with debug icon when LOG_LEVEL is debug', () => {
      vi.stubEnv('LOG_LEVEL', 'debug');
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logDebug('Test debug message');

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Test debug message');
      expect(call).toContain('🐛');
    });

    it('should stay silent at the default info level', () => {
      vi.stubEnv('LOG_LEVEL', '');
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logDebug('Hidden debug message');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('LOG_LEVEL', () => {
    it('should silence info and warn at error level but keep errors', () => {
      vi.stubEnv('LOG_LEVEL', 'error');
      const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logInfo('info');
      logWarn('warn');
      logError('error');

      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should silence info at warn level', () => {
      vi.stubEnv('LOG_LEVEL', 'warn');
      const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logInfo('info');
      logWarn('warn');

      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('should fall back to info for an unknown level', () => {
      vi.stubEnv('LOG_LEVEL', 'verbose-ish');
      const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logInfo('info');

      expect(infoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logScope', () => {
    it('should add the scope name to every message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logScope('mail').info('queued');

      expect(consoleSpy.mock.calls[0][0]).toContain('[mail]');
      expect(consoleSpy.mock.calls[0][0]).toContain('queued');
    });
  });
});
