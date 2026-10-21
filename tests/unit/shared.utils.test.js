import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeRegex, readEmail, readString } from '#src/shared/utils';

describe('shared/utils.js', () => {
  describe('escapeHtml', () => {
    it('escapes the five HTML special characters', () => {
      expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
        '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#039;Jerry&#039;&lt;/a&gt;'
      );
    });

    it('returns an empty string for null and undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('coerces non-strings instead of throwing', () => {
      expect(escapeHtml(42)).toBe('42');
      expect(escapeHtml(0)).toBe('0');
      expect(escapeHtml(false)).toBe('false');
      expect(escapeHtml({ toString: () => '<b>' })).toBe('&lt;b&gt;');
    });
  });

  describe('readString', () => {
    it('returns strings untouched', () => {
      expect(readString('  keep  ')).toBe('  keep  ');
      expect(readString('')).toBe('');
    });

    it('rejects every non-string value', () => {
      expect(readString({ $ne: null })).toBeNull();
      expect(readString({ $regex: '.*' })).toBeNull();
      expect(readString(['a'])).toBeNull();
      expect(readString(12)).toBeNull();
      expect(readString(null)).toBeNull();
      expect(readString(undefined)).toBeNull();
    });
  });

  describe('readEmail', () => {
    it('trims and lowercases a string', () => {
      expect(readEmail('  User@Example.COM ')).toBe('user@example.com');
    });

    it('returns null for an empty or blank string', () => {
      expect(readEmail('')).toBeNull();
      expect(readEmail('   ')).toBeNull();
    });

    it('returns null for operator objects and other non-strings', () => {
      expect(readEmail({ $ne: null })).toBeNull();
      expect(readEmail({ $regex: '^a' })).toBeNull();
      expect(readEmail(['a@b.co'])).toBeNull();
      expect(readEmail(undefined)).toBeNull();
    });
  });

  describe('escapeRegex', () => {
    it('escapes regex metacharacters', () => {
      expect(escapeRegex('a.b*c+d?e(f)[g]{h}|i^j$k\\l')).toBe(
        'a\\.b\\*c\\+d\\?e\\(f\\)\\[g\\]\\{h\\}\\|i\\^j\\$k\\\\l'
      );
    });

    it('produces a pattern that matches the literal text only', () => {
      const pattern = new RegExp(escapeRegex('a.c'));

      expect(pattern.test('a.c')).toBe(true);
      expect(pattern.test('abc')).toBe(false);
    });
  });
});
