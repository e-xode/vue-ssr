import { describe, it, expect, vi } from 'vitest';
import {
  buildSitemapXml,
  collectSitemapEntries,
  createSitemapCache,
  escapeXml,
  getDynamicSitemapEntries,
  getStaticSitemapEntries,
  toLastmod,
} from '#src/shared/sitemap.js';
import { PAGES, LOCALES } from '#src/shared/localizedRoutes.js';

const SITE_URL = 'https://www.example.com';

describe('shared/sitemap.js', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`a&b<c>"d"'e'`)).toBe('a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;');
  });

  it('formats lastmod only for valid dates', () => {
    expect(toLastmod('2026-03-04T10:00:00Z')).toBe('2026-03-04');
    expect(toLastmod(undefined)).toBeNull();
    expect(toLastmod('not a date')).toBeNull();
  });

  it('builds one static entry per page from localizedRoutes', () => {
    const entries = getStaticSitemapEntries();

    expect(entries).toHaveLength(PAGES.length);
    expect(entries[0].paths.en).toBe('/en');
    expect(entries[0].priority).toBe('1.0');
    expect(entries[1].paths.fr).toBe('/fr/contact');
    expect(entries[0].lastmod).toBeUndefined();
  });

  it('returns no dynamic entries by default', async () => {
    expect(await getDynamicSitemapEntries({})).toEqual([]);
  });

  it('renders every locale with alternates and omits unknown lastmod', () => {
    const xml = buildSitemapXml(SITE_URL, getStaticSitemapEntries());

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<loc>${SITE_URL}/en/contact</loc>`);
    expect(xml).toContain(`hreflang="fr" href="${SITE_URL}/fr/contact"`);
    expect(xml).toContain(`hreflang="x-default" href="${SITE_URL}/en/contact"`);
    expect(xml).not.toContain('<lastmod>');
    expect(xml.match(/<url>/g)).toHaveLength(PAGES.length * LOCALES.length);
  });

  it('renders lastmod when known and escapes hrefs', () => {
    const xml = buildSitemapXml(SITE_URL, [
      { paths: { en: '/en/a?x=1&y=2', fr: '/fr/a?x=1&y=2' }, lastmod: '2026-01-02' },
    ]);

    expect(xml).toContain('<lastmod>2026-01-02</lastmod>');
    expect(xml).toContain('/en/a?x=1&amp;y=2');
    expect(xml).not.toContain('x=1&y=2');
  });

  it('keeps the static entries when the dynamic hook fails', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failingHook = vi.fn().mockRejectedValue(new Error('db down'));

    const entries = await collectSitemapEntries(null, failingHook);

    expect(entries).toEqual(getStaticSitemapEntries());
    expect(logged).toHaveBeenCalled();
  });

  it('appends dynamic entries returned by the hook', async () => {
    const extra = { paths: { en: '/en/post/1', fr: '/fr/post/1' } };
    const hook = vi.fn().mockResolvedValue([extra]);

    const entries = await collectSitemapEntries({}, hook);

    expect(hook).toHaveBeenCalledWith({});
    expect(entries).toContain(extra);
  });

  it('caches the generated xml until the ttl expires', async () => {
    let clock = 1000;
    const cache = createSitemapCache({ siteUrl: SITE_URL, db: null, ttlMs: 500, now: () => clock });

    const first = await cache.get();
    clock = 1200;
    const second = await cache.get();
    clock = 2000;
    const third = await cache.get();

    expect(second).toBe(first);
    expect(third).not.toBe(first);
    expect(third.generatedAt).toBe(2000);
  });
});
