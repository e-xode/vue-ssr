import { describe, it, expect } from 'vitest';
import { serializeForScript } from '@/shared/serialize';

describe('shared/serialize.js', () => {
  it('escapes every character that could close or confuse an inline script', () => {
    const value = { html: '</script><!-- a & b \u2028 \u2029' };

    const output = serializeForScript(value);

    expect(output).not.toMatch(/[<>&\u2028\u2029]/);
    expect(output).toContain('\\u003c');
    expect(output).toContain('\\u003e');
    expect(output).toContain('\\u0026');
    expect(output).toContain('\\u2028');
    expect(output).toContain('\\u2029');
  });

  it('round-trips through JSON.parse to the same value', () => {
    const value = { a: ['<b>', 1, null], nested: { text: 'x & y' } };

    expect(JSON.parse(serializeForScript(value))).toEqual(value);
  });

  it('serializes undefined as null', () => {
    expect(serializeForScript(undefined)).toBe('null');
  });
});
