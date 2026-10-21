import { describe, it, expect } from 'vitest';
import { useSsrStatus } from '@/composables/useSsrStatus';

describe('composables/useSsrStatus.js', () => {
  it('sets the status code on an explicit ssr context', () => {
    const ssrContext = {};
    const { setStatusCode } = useSsrStatus(ssrContext);

    expect(setStatusCode(404)).toBe(true);
    expect(ssrContext.statusCode).toBe(404);

    expect(setStatusCode(410)).toBe(true);
    expect(ssrContext.statusCode).toBe(410);
  });

  it('rejects values that are not an http status', () => {
    const ssrContext = {};
    const { setStatusCode } = useSsrStatus(ssrContext);

    expect(setStatusCode('404')).toBe(false);
    expect(setStatusCode(99)).toBe(false);
    expect(setStatusCode(700)).toBe(false);
    expect(ssrContext.statusCode).toBeUndefined();
  });

  it('is a no-op on the client without a context', () => {
    const { setStatusCode } = useSsrStatus();

    expect(setStatusCode(404)).toBe(false);
  });
});
