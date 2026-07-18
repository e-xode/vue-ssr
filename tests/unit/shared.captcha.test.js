import { describe, it, expect, vi, afterEach } from 'vitest';

async function loadVerifyCaptcha() {
  vi.resetModules();
  return (await import('#src/shared/captcha.js')).verifyCaptcha;
}

function jsonResponse(payload) {
  return { json: async () => payload };
}

describe('shared/captcha.js verifyCaptcha', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  describe('outside production', () => {
    it('returns success without calling the verify endpoint', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha(null, 'signup');

      expect(result).toEqual({ success: true, score: 1.0 });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('in production', () => {
    it('short-circuits to success when no secret is configured', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result).toEqual({ success: true, score: 1.0 });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects a missing token', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubGlobal('fetch', vi.fn());

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('', 'signup');

      expect(result).toEqual({ success: false, reason: 'missing' });
    });

    it('rejects when the reCAPTCHA response is unsuccessful', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ success: false })));

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result).toEqual({ success: false, reason: 'invalid' });
    });

    it('rejects a token minted for a different action', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ success: true, score: 0.9, action: 'login' }))
      );

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result).toEqual({ success: false, reason: 'action_mismatch' });
    });

    it('rejects a score below the minimum', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ success: true, score: 0.1, action: 'signup' }))
      );

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('low_score');
      expect(result.score).toBe(0.1);
    });

    it('honors a configurable minimum score', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubEnv('RECAPTCHA_MIN_SCORE', '0.8');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ success: true, score: 0.6, action: 'signup' }))
      );

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result.reason).toBe('low_score');
    });

    it('accepts a valid token and URL-encodes the request body', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'se cret&');
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse({ success: true, score: 0.9, action: 'signup' }));
      vi.stubGlobal('fetch', fetchMock);

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('to ken', 'signup');

      expect(result).toEqual({ success: true, score: 0.9 });
      const [, options] = fetchMock.mock.calls[0];
      expect(options.body).toContain('secret=se%20cret%26');
      expect(options.body).toContain('response=to%20ken');
    });

    it('fails open when the verify request throws', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const verifyCaptcha = await loadVerifyCaptcha();
      const result = await verifyCaptcha('token', 'signup');

      expect(result.success).toBe(true);
    });
  });
});
