import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  ADMIN_USER_PROJECTION,
  EMAIL_REGEX,
  SESSION_COOKIE_BASE_OPTIONS,
  SESSION_COOKIE_NAME,
  USER_SAFE_PROJECTION,
} from '#src/shared/const';

describe('shared/const.js', () => {
  describe('USER_SAFE_PROJECTION', () => {
    const SENSITIVE_FIELD = /password|code|attempt|pending|expires|failure|history|secret|token/i;
    const SOURCE_DIRS = ['src/api', 'src/shared'];
    const WRITTEN_FIELD = /^\s*\[?([A-Za-z_]+)\]?:/gm;

    function listSourceFiles(dir) {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return listSourceFiles(entryPath);
        return entry.name.endsWith('.js') ? [entryPath] : [];
      });
    }

    function sensitiveFieldsInSource() {
      const fields = new Set();
      for (const file of SOURCE_DIRS.flatMap(listSourceFiles)) {
        const source = fs.readFileSync(file, 'utf-8');
        for (const [, field] of source.matchAll(WRITTEN_FIELD)) {
          if (SENSITIVE_FIELD.test(field)) fields.add(field);
        }
      }
      return fields;
    }

    it('is an allowlist: every entry includes a field', () => {
      expect(Object.values(USER_SAFE_PROJECTION).every((value) => value === 1)).toBe(true);
      expect(Object.values(ADMIN_USER_PROJECTION).every((value) => value === 1)).toBe(true);
    });

    it('finds the security fields the API writes', () => {
      const fields = sensitiveFieldsInSource();

      expect(fields).toContain('securityCode');
      expect(fields).toContain('pendingEmailCode');
      expect(fields).toContain('password');
    });

    it('returns no security field written anywhere in the API', () => {
      const sensitive = sensitiveFieldsInSource();
      const exposed = Object.keys(USER_SAFE_PROJECTION).filter(
        (field) => sensitive.has(field) || SENSITIVE_FIELD.test(field)
      );

      expect(exposed).toEqual([]);
    });

    it('keeps codes and passwords out of the admin projection too', () => {
      const exposed = Object.keys(ADMIN_USER_PROJECTION).filter((field) =>
        /password|code|attempt|pending|failure|secret|token/i.test(field)
      );

      expect(exposed).toEqual([]);
    });
  });

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
