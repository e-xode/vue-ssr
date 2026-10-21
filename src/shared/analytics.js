import { readMetaContent } from '@/composables/useMetaContent';
import { useConsent } from '@/composables/useConsent';
import {
  GA_ID_META_NAME,
  GA_ID_PATTERN,
  GTAG_SCRIPT_URL,
  CONSENT_WAIT_FOR_UPDATE_MS,
} from '@/shared/clientConstants';

let analyticsInitialized = false;

function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

function defineGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtagCommand() {
    window.dataLayer.push(arguments);
  };
}

function readGaId() {
  const gaId = readMetaContent(GA_ID_META_NAME);
  return GA_ID_PATTERN.test(gaId) ? gaId : '';
}

function appendGtagScript(gaId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `${GTAG_SCRIPT_URL}?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (analyticsInitialized || typeof window === 'undefined') return false;
  const gaId = readGaId();
  if (!gaId) return false;

  analyticsInitialized = true;
  const { getConsent, applyConsent } = useConsent();

  defineGtag();
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: CONSENT_WAIT_FOR_UPDATE_MS,
  });
  const stored = getConsent();
  if (stored) applyConsent(stored);
  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: false });
  appendGtagScript(gaId);
  return true;
}

export function trackPageView(path, title) {
  gtag('event', 'page_view', { page_path: path, page_title: title });
}

export function trackEvent(eventName, params = {}) {
  gtag('event', eventName, params);
}

export function trackSignup(method = 'email') {
  gtag('event', 'sign_up', { method });
}

export function trackLogin(method = 'email') {
  gtag('event', 'login', { method });
}

export function trackContactForm() {
  gtag('event', 'generate_lead', { source: 'contact_form' });
}
