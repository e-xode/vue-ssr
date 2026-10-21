import {
  REVEAL_CLASS,
  REVEAL_VISIBLE_CLASS,
  REVEAL_OBSERVER_OPTIONS,
  REDUCED_MOTION_QUERY,
} from '@/shared/clientConstants';

let sharedObserver = null;

function showElement(el) {
  el.classList.add(REVEAL_VISIBLE_CLASS);
}

function handleIntersect(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    showElement(entry.target);
    sharedObserver.unobserve(entry.target);
  }
}

function getSharedObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(handleIntersect, REVEAL_OBSERVER_OPTIONS);
  }
  return sharedObserver;
}

function canAnimate() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return false;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function isInInitialViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

export const reveal = {
  mounted(el) {
    if (!canAnimate() || isInInitialViewport(el)) return;
    el.classList.add(REVEAL_CLASS);
    getSharedObserver().observe(el);
  },
  unmounted(el) {
    sharedObserver?.unobserve(el);
    el.classList.remove(REVEAL_CLASS, REVEAL_VISIBLE_CLASS);
  },
};

export default reveal;
