import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useConsent } from '@/composables/useConsent';

describe('composables/useConsent.js', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.gtag;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null and no choice when nothing is stored', () => {
    const { getConsent, hasChoice } = useConsent();
    expect(getConsent()).toBe(null);
    expect(hasChoice()).toBe(false);
  });

  it('only recognises granted or denied values', () => {
    const { getConsent } = useConsent();

    window.localStorage.setItem('cookie-consent', 'garbage');
    expect(getConsent()).toBe(null);

    window.localStorage.setItem('cookie-consent', 'granted');
    expect(getConsent()).toBe('granted');
  });

  it('persists the choice and marks it as chosen', () => {
    const { setConsent, getConsent, hasChoice } = useConsent();

    setConsent('denied');

    expect(window.localStorage.getItem('cookie-consent')).toBe('denied');
    expect(getConsent()).toBe('denied');
    expect(hasChoice()).toBe(true);
  });

  it('updates all gtag consent signals to granted', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const { setConsent } = useConsent();

    setConsent('granted');

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  });

  it('maps a denied choice to all-denied signals', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const { applyConsent } = useConsent();

    applyConsent('denied');

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('does not throw when gtag is absent', () => {
    const { setConsent } = useConsent();
    expect(() => setConsent('granted')).not.toThrow();
  });
});
