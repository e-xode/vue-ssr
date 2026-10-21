import { describe, it, expect, vi } from 'vitest';

const messages = {
  'error.server': 'Server error',
  'error.auth.invalidCode': 'Invalid code',
  'admin.users.title': 'Users',
};

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => messages[key] ?? key,
    te: (key) => key in messages,
  }),
}));

import { useApiError } from '@/composables/useApiError';

describe('composables/useApiError.js', () => {
  const { translateError } = useApiError();

  it('translates a known error key', () => {
    expect(translateError('error.auth.invalidCode')).toBe('Invalid code');
  });

  it('reads the key from an error object message', () => {
    expect(translateError(new Error('error.auth.invalidCode'))).toBe('Invalid code');
  });

  it('reads the key from an api error payload', () => {
    expect(translateError({ error: 'error.auth.invalidCode' })).toBe('Invalid code');
  });

  it('falls back to the generic server error for an unknown error key', () => {
    expect(translateError('error.doesNotExist')).toBe('Server error');
  });

  it('falls back to the given key when the error is unknown', () => {
    expect(translateError('Something broke', 'error.auth.invalidCode')).toBe('Invalid code');
  });

  it('prefers a known error key over the given fallback', () => {
    expect(translateError('error.server', 'error.auth.invalidCode')).toBe('Server error');
  });

  it('never exposes a raw server message', () => {
    expect(translateError(new Error('connect ECONNREFUSED 10.0.0.1:27017'))).toBe('Server error');
  });

  it('never translates a key outside the error namespace', () => {
    expect(translateError('admin.users.title')).toBe('Server error');
  });

  it.each([[null], [undefined], [''], [42], [{}]])(
    'falls back to the generic server error for %s',
    (value) => {
      expect(translateError(value)).toBe('Server error');
    }
  );
});
