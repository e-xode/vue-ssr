import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function setSiteKeyMeta(content) {
  document.head.innerHTML = `<meta name="recaptcha-site-key" content="${content}">`;
}

async function loadUseCaptcha() {
  vi.resetModules();
  const module = await import('@/composables/useCaptcha');
  return module.useCaptcha();
}

function installGrecaptcha(token) {
  window.grecaptcha = {
    ready: (callback) => callback(),
    execute: vi.fn().mockResolvedValue(token),
  };
}

describe('composables/useCaptcha.js', () => {
  let appendSpy;

  beforeEach(() => {
    document.head.innerHTML = '';
    delete window.grecaptcha;
    appendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      queueMicrotask(() => node.onload?.());
      return node;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null without a recaptcha-site-key meta', async () => {
    const { executeRecaptcha } = await loadUseCaptcha();

    expect(await executeRecaptcha('signin')).toBeNull();
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('loads the script with the meta site key and executes the action', async () => {
    setSiteKeyMeta('site-key-123');
    installGrecaptcha('token-abc');
    const { executeRecaptcha } = await loadUseCaptcha();

    const token = await executeRecaptcha('signin');

    expect(token).toBe('token-abc');
    expect(appendSpy.mock.calls[0][0].src).toBe(
      'https://www.google.com/recaptcha/api.js?render=site-key-123'
    );
    expect(window.grecaptcha.execute).toHaveBeenCalledWith('site-key-123', { action: 'signin' });
  });

  it('returns null and logs when the script fails to load', async () => {
    setSiteKeyMeta('site-key-123');
    appendSpy.mockImplementation((node) => {
      queueMicrotask(() => node.onerror?.());
      return node;
    });
    const { executeRecaptcha } = await loadUseCaptcha();

    expect(await executeRecaptcha('signin')).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
