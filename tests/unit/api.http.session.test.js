import { describe, it, expect } from 'vitest';
import { assertProductionSecret, isStrongSessionSecret } from '#src/api/http/session.js';
import { SESSION_FALLBACK_SECRET } from '#src/api/http/constants.js';

const STRONG_SECRET = 'a'.repeat(16) + 'b'.repeat(16);

describe('api/http/session.js', () => {
  describe('isStrongSessionSecret', () => {
    it('accepts a value of at least 32 characters', () => {
      expect(isStrongSessionSecret(STRONG_SECRET)).toBe(true);
    });

    it('rejects short values, placeholders and non-strings', () => {
      expect(isStrongSessionSecret('short-secret')).toBe(false);
      expect(isStrongSessionSecret(SESSION_FALLBACK_SECRET)).toBe(false);
      expect(isStrongSessionSecret('your-secret-key-change-in-production')).toBe(false);
      expect(isStrongSessionSecret(undefined)).toBe(false);
    });
  });

  describe('assertProductionSecret', () => {
    it('does not check the secret outside production', () => {
      expect(() => assertProductionSecret({ NODE_ENV: 'development' })).not.toThrow();
      expect(() =>
        assertProductionSecret({ NODE_ENV: 'development', COOKIE_SECRET: 'short' })
      ).not.toThrow();
    });

    it('throws in production when the secret is missing', () => {
      expect(() => assertProductionSecret({ NODE_ENV: 'production' })).toThrow(/required/);
    });

    it('throws in production for a short secret or the documented placeholder', () => {
      expect(() =>
        assertProductionSecret({ NODE_ENV: 'production', COOKIE_SECRET: 'short-secret' })
      ).toThrow(/too weak/);
      expect(() =>
        assertProductionSecret({
          NODE_ENV: 'production',
          COOKIE_SECRET: 'your-secret-key-change-in-production',
        })
      ).toThrow(/too weak/);
    });

    it('accepts a strong secret in production', () => {
      expect(() =>
        assertProductionSecret({ NODE_ENV: 'production', COOKIE_SECRET: STRONG_SECRET })
      ).not.toThrow();
    });
  });
});
