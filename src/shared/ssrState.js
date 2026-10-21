import { SSR_STATE_ELEMENT_ID } from '@/shared/clientConstants';

export function readSsrState(doc = typeof document === 'undefined' ? null : document) {
  const element = doc?.getElementById(SSR_STATE_ELEMENT_ID);
  if (!element) return null;
  try {
    const state = JSON.parse(element.textContent);
    return state && typeof state === 'object' && !Array.isArray(state) ? state : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
