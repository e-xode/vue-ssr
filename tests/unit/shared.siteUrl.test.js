import { describe, it, expect } from 'vitest';
import {
  assertProductionSiteUrl,
  isPublicHttpsOrigin,
  resolveSiteUrl,
} from '#src/shared/siteUrl.js';

describe('shared/siteUrl.js', () => {
  describe('isPublicHttpsOrigin', () => {
    it('accepts a public https origin', () => {
      expect(isPublicHttpsOrigin('https://www.example.com')).toBe(true);
    });

    it('rejects http, local hosts and garbage', () => {
      expect(isPublicHttpsOrigin('http://www.example.com')).toBe(false);
      expect(isPublicHttpsOrigin('https://localhost')).toBe(false);
      expect(isPublicHttpsOrigin('https://127.0.0.1:3002')).toBe(false);
      expect(isPublicHttpsOrigin('https://[::1]')).toBe(false);
      expect(isPublicHttpsOrigin('not a url')).toBe(false);
      expect(isPublicHttpsOrigin('')).toBe(false);
    });
  });

  describe('assertProductionSiteUrl', () => {
    it('does nothing outside production', () => {
      expect(() => assertProductionSiteUrl({ NODE_ENV: 'development' })).not.toThrow();
      expect(() => assertProductionSiteUrl({ NODE_ENV: 'test', NODE_HOST: '' })).not.toThrow();
    });

    it('throws with a fix hint when NODE_HOST is missing, http or local', () => {
      expect(() => assertProductionSiteUrl({ NODE_ENV: 'production' })).toThrow(/NODE_HOST/);
      expect(() =>
        assertProductionSiteUrl({ NODE_ENV: 'production', NODE_HOST: 'http://example.com' })
      ).toThrow(/public https origin/);
      expect(() =>
        assertProductionSiteUrl({ NODE_ENV: 'production', NODE_HOST: 'https://localhost:3002' })
      ).toThrow(/localhost/);
    });

    it('accepts a public https origin in production', () => {
      expect(() =>
        assertProductionSiteUrl({ NODE_ENV: 'production', NODE_HOST: 'https://www.example.com' })
      ).not.toThrow();
    });
  });

  describe('resolveSiteUrl', () => {
    it('strips trailing slashes from NODE_HOST', () => {
      expect(resolveSiteUrl({ NODE_HOST: 'https://www.example.com//' })).toBe(
        'https://www.example.com'
      );
    });

    it('falls back to localhost outside production', () => {
      expect(resolveSiteUrl({ NODE_ENV: 'development', NODE_PORT: '4000' })).toBe(
        'http://localhost:4000'
      );
      expect(resolveSiteUrl({})).toBe('http://localhost:3002');
    });

    it('never falls back to localhost in production', () => {
      expect(() => resolveSiteUrl({ NODE_ENV: 'production' })).toThrow(/NODE_HOST/);
    });
  });
});
