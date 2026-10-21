import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const observe = vi.fn();
const unobserve = vi.fn();
let observerCallback = null;
let observerCount = 0;

class FakeIntersectionObserver {
  constructor(callback) {
    observerCallback = callback;
    observerCount += 1;
    this.observe = observe;
    this.unobserve = unobserve;
  }
}

function mockReducedMotion(reduced) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduced });
}

function createElement(top) {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({ top, bottom: top + 100 });
  return el;
}

async function loadReveal() {
  vi.resetModules();
  return (await import('@/directives/reveal')).reveal;
}

describe('directives/reveal.js', () => {
  beforeEach(() => {
    observe.mockClear();
    unobserve.mockClear();
    observerCount = 0;
    window.innerHeight = 800;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks an off-screen element and observes it', async () => {
    const reveal = await loadReveal();
    const el = createElement(2000);

    reveal.mounted(el);

    expect(el.classList.contains('reveal')).toBe(true);
    expect(observe).toHaveBeenCalledWith(el);
  });

  it('adds the visible class once the element intersects and stops observing it', async () => {
    const reveal = await loadReveal();
    const el = createElement(2000);
    reveal.mounted(el);

    observerCallback([{ isIntersecting: false, target: el }]);
    expect(el.classList.contains('reveal--visible')).toBe(false);

    observerCallback([{ isIntersecting: true, target: el }]);
    expect(el.classList.contains('reveal--visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it('shares one observer between elements', async () => {
    const reveal = await loadReveal();

    reveal.mounted(createElement(2000));
    reveal.mounted(createElement(3000));

    expect(observerCount).toBe(1);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('leaves elements already in the viewport untouched', async () => {
    const reveal = await loadReveal();
    const el = createElement(100);

    reveal.mounted(el);

    expect(el.classList.contains('reveal')).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });

  it('does nothing when the user prefers reduced motion', async () => {
    mockReducedMotion(true);
    const reveal = await loadReveal();
    const el = createElement(2000);

    reveal.mounted(el);

    expect(el.classList.contains('reveal')).toBe(false);
    expect(observe).not.toHaveBeenCalled();
  });

  it('does nothing when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const reveal = await loadReveal();
    const el = createElement(2000);

    reveal.mounted(el);

    expect(el.classList.contains('reveal')).toBe(false);
  });

  it('cleans up on unmount', async () => {
    const reveal = await loadReveal();
    const el = createElement(2000);
    reveal.mounted(el);

    reveal.unmounted(el);

    expect(unobserve).toHaveBeenCalledWith(el);
    expect(el.classList.contains('reveal')).toBe(false);
  });
});
