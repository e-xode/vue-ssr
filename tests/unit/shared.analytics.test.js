import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function setGaMeta(content) {
  document.head.innerHTML = `<meta name="ga-id" content="${content}">`;
}

function recordedCommands() {
  return window.dataLayer.map((entry) => Array.from(entry));
}

async function loadAnalytics() {
  vi.resetModules();
  return import('@/shared/analytics');
}

describe('shared/analytics.js', () => {
  let appendSpy;

  beforeEach(() => {
    document.head.innerHTML = '';
    window.localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
    appendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing without a ga-id meta', async () => {
    const { initAnalytics } = await loadAnalytics();

    expect(initAnalytics()).toBe(false);
    expect(window.gtag).toBeUndefined();
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('rejects a ga-id that does not match the measurement id format', async () => {
    setGaMeta('UA-123');
    const { initAnalytics } = await loadAnalytics();

    expect(initAnalytics()).toBe(false);
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('sets the consent default to denied before js and config', async () => {
    setGaMeta('G-TEST123');
    const { initAnalytics } = await loadAnalytics();

    expect(initAnalytics()).toBe(true);

    const commands = recordedCommands();
    expect(commands.map((command) => command[0])).toEqual(['consent', 'js', 'config']);
    expect(commands[0][1]).toBe('default');
    expect(commands[0][2]).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    expect(commands[2].slice(1)).toEqual(['G-TEST123', { send_page_view: false }]);
  });

  it('applies the stored consent before config', async () => {
    window.localStorage.setItem('cookie-consent', 'granted');
    setGaMeta('G-TEST123');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics();

    const commands = recordedCommands();
    expect(commands.map((command) => command[0])).toEqual(['consent', 'consent', 'js', 'config']);
    expect(commands[1][1]).toBe('update');
    expect(commands[1][2].analytics_storage).toBe('granted');
  });

  it('loads gtag.js once from client code', async () => {
    setGaMeta('G-TEST123');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics();
    initAnalytics();

    expect(appendSpy).toHaveBeenCalledTimes(1);
    const script = appendSpy.mock.calls[0][0];
    expect(script.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123');
    expect(script.async).toBe(true);
  });

  it('tracks a page view through gtag when available', async () => {
    const { trackPageView } = await loadAnalytics();
    window.gtag = vi.fn();

    trackPageView('/en/contact', 'Contact');

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/en/contact',
      page_title: 'Contact',
    });
  });

  it('does not throw when gtag is absent', async () => {
    const { trackPageView, trackEvent } = await loadAnalytics();

    expect(() => trackPageView('/en', 'Home')).not.toThrow();
    expect(() => trackEvent('x')).not.toThrow();
  });
});
