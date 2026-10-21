import { LOCALES, DEFAULT_LOCALE, PAGES, localizedPath } from './localizedRoutes.js';
import {
  SITEMAP_CACHE_TTL_MS,
  SITEMAP_DEFAULT_CHANGEFREQ,
  SITEMAP_HOME_PRIORITY,
  SITEMAP_PAGE_PRIORITY,
  SITEMAP_XML_NAMESPACES,
  X_DEFAULT_HREFLANG,
} from './seoConstants.js';

const XML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

export function toLastmod(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

export function getStaticSitemapEntries() {
  return PAGES.map((page) => ({
    paths: Object.fromEntries(LOCALES.map((locale) => [locale, localizedPath(page.name, locale)])),
    priority: page.slugs[DEFAULT_LOCALE] === '' ? SITEMAP_HOME_PRIORITY : SITEMAP_PAGE_PRIORITY,
  }));
}

export async function getDynamicSitemapEntries() {
  return [];
}

export async function collectSitemapEntries(db, loadDynamicEntries = getDynamicSitemapEntries) {
  const staticEntries = getStaticSitemapEntries();
  try {
    const dynamicEntries = await loadDynamicEntries(db);
    return [...staticEntries, ...dynamicEntries];
  } catch (err) {
    console.error(err);
    return staticEntries;
  }
}

function alternateLink(hreflang, href) {
  return `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`;
}

function alternateLinks(siteUrl, paths) {
  const links = LOCALES.filter((locale) => paths[locale]).map((locale) =>
    alternateLink(locale, `${siteUrl}${paths[locale]}`)
  );
  const defaultPath = paths[DEFAULT_LOCALE];
  if (defaultPath) links.push(alternateLink(X_DEFAULT_HREFLANG, `${siteUrl}${defaultPath}`));
  return links.join('\n');
}

function urlBlock(siteUrl, entry, locale) {
  const lastmod = toLastmod(entry.lastmod);
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${entry.paths[locale]}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    alternateLinks(siteUrl, entry.paths),
    `    <changefreq>${entry.changefreq || SITEMAP_DEFAULT_CHANGEFREQ}</changefreq>`,
    `    <priority>${entry.priority || SITEMAP_PAGE_PRIORITY}</priority>`,
    '  </url>',
  ];
  return lines.filter(Boolean).join('\n');
}

export function buildSitemapXml(siteUrl, entries) {
  const blocks = entries.flatMap((entry) =>
    LOCALES.filter((locale) => entry.paths[locale]).map((locale) =>
      urlBlock(siteUrl, entry, locale)
    )
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset ${SITEMAP_XML_NAMESPACES}>`,
    ...blocks,
    '</urlset>',
  ].join('\n');
}

export function createSitemapCache({
  siteUrl,
  db,
  ttlMs = SITEMAP_CACHE_TTL_MS,
  now = Date.now,
} = {}) {
  let cached = { xml: '', generatedAt: 0 };

  async function get() {
    const current = now();
    if (!cached.xml || current - cached.generatedAt > ttlMs) {
      const entries = await collectSitemapEntries(db);
      cached = { xml: buildSitemapXml(siteUrl, entries), generatedAt: current };
    }
    return cached;
  }

  return { get };
}
