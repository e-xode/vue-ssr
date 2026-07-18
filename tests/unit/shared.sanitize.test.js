import { describe, it, expect } from 'vitest';
import { sanitize, isEmptyHtml } from '#src/shared/sanitize';

describe('shared/sanitize.js', () => {
  describe('sanitize', () => {
    it('returns an empty string for non-string input', () => {
      expect(sanitize(null)).toBe('');
      expect(sanitize(undefined)).toBe('');
      expect(sanitize(42)).toBe('');
      expect(sanitize('')).toBe('');
    });

    it('strips script tags and their content', () => {
      const out = sanitize('<p>safe</p><script>alert(1)</script>');
      expect(out).toContain('<p>safe</p>');
      expect(out).not.toContain('<script');
      expect(out).not.toContain('alert(1)');
    });

    it('strips inline event-handler attributes', () => {
      const out = sanitize('<p onclick="steal()">hi</p>');
      expect(out).not.toContain('onclick');
      expect(out).toContain('hi');
    });

    it('keeps allowed formatting tags', () => {
      const out = sanitize('<strong>bold</strong> <em>italic</em> <ul><li>x</li></ul>');
      expect(out).toContain('<strong>bold</strong>');
      expect(out).toContain('<em>italic</em>');
      expect(out).toContain('<li>x</li>');
    });

    it('forces rel and target on links', () => {
      const out = sanitize('<a href="https://example.com">link</a>');
      expect(out).toContain('target="_blank"');
      expect(out).toContain('rel="noopener noreferrer"');
    });

    it('drops javascript: hrefs', () => {
      const out = sanitize('<a href="javascript:alert(1)">x</a>');
      expect(out).not.toContain('javascript:');
    });

    it('allows whitelisted iframe hosts and removes others', () => {
      const allowed = sanitize('<iframe src="https://www.youtube.com/embed/abc"></iframe>');
      expect(allowed).toContain('youtube.com');

      const blocked = sanitize('<iframe src="https://evil.example/x"></iframe>');
      expect(blocked).not.toContain('evil.example');
    });
  });

  describe('isEmptyHtml', () => {
    it('treats falsy and tag-only markup as empty', () => {
      expect(isEmptyHtml('')).toBe(true);
      expect(isEmptyHtml(null)).toBe(true);
      expect(isEmptyHtml(undefined)).toBe(true);
      expect(isEmptyHtml('<p></p>')).toBe(true);
      expect(isEmptyHtml('<p><br></p>')).toBe(true);
    });

    it('detects real text content', () => {
      expect(isEmptyHtml('<p>hello</p>')).toBe(false);
      expect(isEmptyHtml('text')).toBe(false);
    });
  });
});
