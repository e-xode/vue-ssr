import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMailTransport,
  generateSecurityCode,
  hashCode,
  isDevMailMode,
  verifyCode,
} from '#src/shared/email';

function loggedLines() {
  return vi.mocked(console.log).mock.calls.map(([line]) => line);
}

describe('shared/email.js development transport', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('nodemailer');
    vi.resetModules();
  });

  it('is active only outside production and without MAILER_HOST', () => {
    expect(isDevMailMode({ NODE_ENV: 'development' })).toBe(true);
    expect(isDevMailMode({ NODE_ENV: 'development', MAILER_HOST: 'smtp.example.com' })).toBe(false);
    expect(isDevMailMode({ NODE_ENV: 'production' })).toBe(false);
    expect(isDevMailMode({ NODE_ENV: 'production', MAILER_HOST: '' })).toBe(false);
  });

  it('builds a transport that sends nothing over the network', async () => {
    const transport = createMailTransport({ NODE_ENV: 'development' });

    const info = await transport.sendMail({ to: 'user@example.com', subject: 'Hi', html: '' });

    expect(JSON.parse(info.message).subject).toBe('Hi');
  });

  it('keeps the SMTP transport when MAILER_HOST is set', () => {
    const transport = createMailTransport({
      NODE_ENV: 'development',
      MAILER_HOST: 'smtp.example.com',
    });

    expect(transport.options.host).toBe('smtp.example.com');
    expect(transport.options.jsonTransport).toBeUndefined();
  });

  it('prints the security code to the console in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MAILER_HOST', '');
    vi.resetModules();
    const { sendSecurityCodeEmail } = await import('#src/shared/email');

    const result = await sendSecurityCodeEmail('user@example.com', '123456', 'en');

    expect(result).toEqual({ success: true });
    expect(loggedLines().some((line) => line.includes('code for user@example.com: 123456'))).toBe(
      true
    );
  });

  it('never prints the security code in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MAILER_HOST', '');
    vi.resetModules();
    const sendMail = vi.fn().mockResolvedValue({});
    vi.doMock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }));
    const { sendSecurityCodeEmail } = await import('#src/shared/email');

    const result = await sendSecurityCodeEmail('user@example.com', '123456', 'en');

    expect(result).toEqual({ success: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(loggedLines().some((line) => String(line).includes('123456'))).toBe(false);
  });
});

describe('shared/email.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSecurityCode', () => {
    it('should generate a 6-digit security code', async () => {
      const code = await generateSecurityCode();

      expect(code).toBeDefined();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should generate different codes on each call', async () => {
      const code1 = await generateSecurityCode();
      const code2 = await generateSecurityCode();

      expect(code1).not.toEqual(code2);
    });

    it('should always be numeric only', async () => {
      for (let i = 0; i < 5; i++) {
        const code = await generateSecurityCode();
        expect(/^\d{6}$/.test(code)).toBe(true);
      }
    });
  });

  describe('verifyCode', () => {
    it('accepts the matching code', () => {
      expect(verifyCode(hashCode('123456'), '123456')).toBe(true);
    });

    it('rejects a wrong code, a malformed hash and non-strings without throwing', () => {
      expect(verifyCode(hashCode('123456'), '654321')).toBe(false);
      expect(verifyCode('short', '123456')).toBe(false);
      expect(verifyCode(undefined, '123456')).toBe(false);
      expect(verifyCode(hashCode('123456'), { $ne: null })).toBe(false);
    });
  });

  describe('hashCode', () => {
    it('should hash a security code', () => {
      const code = '123456';
      const hash = hashCode(code);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toEqual(code);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce consistent hash for same code', () => {
      const code = '123456';
      const hash1 = hashCode(code);
      const hash2 = hashCode(code);

      expect(hash1).toEqual(hash2);
    });

    it('should produce different hash for different codes', () => {
      const hash1 = hashCode('123456');
      const hash2 = hashCode('654321');

      expect(hash1).not.toEqual(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashCode('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });
});
