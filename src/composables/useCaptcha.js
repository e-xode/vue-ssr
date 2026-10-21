import { readMetaContent } from '@/composables/useMetaContent';
import { RECAPTCHA_SITE_KEY_META_NAME, RECAPTCHA_SCRIPT_URL } from '@/shared/clientConstants';

let scriptLoaded = false;
let scriptLoading = null;

function loadScript(siteKey) {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${RECAPTCHA_SCRIPT_URL}?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function useCaptcha() {
  async function executeRecaptcha(action) {
    if (typeof window === 'undefined') return null;

    const siteKey = readMetaContent(RECAPTCHA_SITE_KEY_META_NAME);
    if (!siteKey) return null;

    try {
      await loadScript(siteKey);
      await new Promise((resolve) => window.grecaptcha.ready(resolve));
      return await window.grecaptcha.execute(siteKey, { action });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  return { executeRecaptcha };
}
