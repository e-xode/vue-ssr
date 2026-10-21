import { describe, it, expect } from 'vitest';
import { EMAIL_REGEX, SESSION_COOKIE_BASE_OPTIONS, SESSION_COOKIE_NAME } from '#src/shared/const';

describe('shared/const.js', () => {
  describe('EMAIL_REGEX', () => {
    it.each([
      'user@example.com',
      'first.last@mail.example.co.uk',
      'user+tag@example.org',
      'a@b.co',
    ])('accepts %s', (address) => {
      expect(EMAIL_REGEX.test(address)).toBe(true);
    });

    it.each(['', 'plain', 'no-at.example.com', 'a@b', 'a b@example.com', 'a@@example.com'])(
      'rejects %j',
      (address) => {
        expect(EMAIL_REGEX.test(address)).toBe(false);
      }
    );

    it('bounds the local part, domain and tld lengths', () => {
      expect(EMAIL_REGEX.test(`${'a'.repeat(64)}@example.com`)).toBe(true);
      expect(EMAIL_REGEX.test(`${'a'.repeat(65)}@example.com`)).toBe(false);
      expect(EMAIL_REGEX.test(`a@example.${'c'.repeat(63)}`)).toBe(true);
      expect(EMAIL_REGEX.test(`a@example.${'c'.repeat(64)}`)).toBe(false);
      expect(EMAIL_REGEX.test(`a@${'d'.repeat(256)}.com`)).toBe(false);
    });

    it('rejects a long dot-heavy hostile input quickly', () => {
      const hostile = `a@${'.'.repeat(50000)}!`;
      const started = performance.now();

      expect(EMAIL_REGEX.test(hostile)).toBe(false);
      expect(performance.now() - started).toBeLessThan(200);
    });
  });

  describe('session cookie constants', () => {
    it('exposes the cookie name and base options', () => {
      expect(SESSION_COOKIE_NAME).toBe('app.sid');
      expect(SESSION_COOKIE_BASE_OPTIONS).toEqual({
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
      });
    });
  });
});
