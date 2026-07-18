import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch } from '#src/shared/api';

function okResponse(payload) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  };
}

describe('shared/api.js apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns parsed JSON on a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ status: 'ok' })));
    const data = await apiFetch('/api/x');
    expect(data).toEqual({ status: 'ok' });
  });

  it('sends credentials and a JSON content-type by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/x', { method: 'POST', body: '{}' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe('include');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.signal).toBeDefined();
  });

  it('does not leak the timeout option into the fetch init', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/x', { timeout: 5000 });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.timeout).toBeUndefined();
  });

  it('throws an error carrying status and error on a failed response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'error.rateLimit' }),
      })
    );

    await expect(apiFetch('/api/x')).rejects.toMatchObject({
      status: 429,
      error: 'error.rateLimit',
      isRateLimit: true,
    });
  });

  it('aborts the request when the custom timeout elapses', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (url, init) =>
        new Promise((resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')));
        })
    );
    vi.stubGlobal('fetch', fetchMock);

    let caught;
    const done = apiFetch('/api/slow', { timeout: 1000 }).catch((err) => {
      caught = err;
    });
    await vi.advanceTimersByTimeAsync(1000);
    await done;

    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe('aborted');
  });
});
