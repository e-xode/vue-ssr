import { describe, it, expect } from 'vitest';
import { buildCsp } from '#src/api/http/csp.js';

describe('api/http/csp.js', () => {
  describe('production', () => {
    const csp = buildCsp(true);

    it('does not allow inline or eval scripts', () => {
      expect(csp.scriptSrc).not.toContain("'unsafe-inline'");
      expect(csp.scriptSrc).not.toContain("'unsafe-eval'");
    });

    it('allows only the Google script origins in use', () => {
      expect(csp.scriptSrc).toEqual([
        "'self'",
        'https://www.googletagmanager.com',
        'https://www.google.com/recaptcha/',
        'https://www.gstatic.com/recaptcha/',
      ]);
    });

    it('does not allow arbitrary https images', () => {
      expect(csp.imgSrc).not.toContain('https:');
      expect(csp.imgSrc).toContain("'self'");
      expect(csp.imgSrc).toContain('data:');
    });

    it('allows analytics collection and no websocket', () => {
      expect(csp.connectSrc).toContain('https://*.google-analytics.com');
      expect(csp.connectSrc).toContain('https://*.analytics.google.com');
      expect(csp.connectSrc).not.toContain('ws:');
      expect(csp.connectSrc).not.toContain('wss:');
    });

    it('keeps upgrade-insecure-requests on', () => {
      expect('upgradeInsecureRequests' in csp).toBe(false);
    });
  });

  describe('development', () => {
    const csp = buildCsp(false);

    it('keeps vite working', () => {
      expect(csp.scriptSrc).toContain("'unsafe-inline'");
      expect(csp.scriptSrc).toContain("'unsafe-eval'");
      expect(csp.connectSrc).toContain('ws:');
      expect(csp.connectSrc).toContain('wss:');
    });

    it('disables upgrade-insecure-requests', () => {
      expect(csp.upgradeInsecureRequests).toBeNull();
    });
  });
});
