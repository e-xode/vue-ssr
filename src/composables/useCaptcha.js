let scriptLoaded = false;
let scriptLoading = null;

function loadScript(siteKey) {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
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

    const siteKey = window.__RECAPTCHA_SITE_KEY__;
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
