const STORAGE_KEY = 'cookie-consent';

const CONSENT_SIGNALS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];

export function useConsent() {
  function getConsent() {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function applyConsent(value) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const state = value === 'granted' ? 'granted' : 'denied';
    const update = {};
    for (const signal of CONSENT_SIGNALS) update[signal] = state;
    window.gtag('consent', 'update', update);
  }

  function setConsent(value) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      console.error(err);
    }
    applyConsent(value);
  }

  function hasChoice() {
    return getConsent() !== null;
  }

  return { getConsent, setConsent, applyConsent, hasChoice };
}
