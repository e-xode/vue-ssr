import { LOCALE_CODES, DEFAULT_LOCALE as KIT_DEFAULT_LOCALE } from './const.js';

export const LOCALES = LOCALE_CODES;

export const DEFAULT_LOCALE = KIT_DEFAULT_LOCALE;

export const PAGES = [
  { name: 'Index', slugs: { en: '', fr: '' } },
  { name: 'Contact', slugs: { en: 'contact', fr: 'contact' } },
];

function trimSlashes(value) {
  return String(value ?? '').replace(/^\/+|\/+$/g, '');
}

function resolveLocale(locale) {
  return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function joinLocalized(locale, slug) {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

export function pageSlugs(pageName) {
  const page = PAGES.find((entry) => entry.name === pageName);
  if (!page) return [];
  return [...new Set(LOCALES.map((locale) => page.slugs[locale]))];
}

export function findPageBySlug(slug) {
  const normalized = trimSlashes(slug);
  return PAGES.find((page) => LOCALES.some((locale) => page.slugs[locale] === normalized)) || null;
}

export function localizedPath(pageName, locale) {
  const page = PAGES.find((entry) => entry.name === pageName);
  if (!page) return null;
  const resolved = resolveLocale(locale);
  return joinLocalized(resolved, page.slugs[resolved]);
}

export function localizeSubPath(subPath, locale) {
  const normalized = trimSlashes(subPath);
  const page = findPageBySlug(normalized);
  if (!page) return subPath;
  const slug = page.slugs[resolveLocale(locale)];
  return slug ? `/${slug}` : '';
}

export function pathLocaleMismatch(path) {
  const [pathname] = String(path ?? '').split(/[?#]/);
  const segments = trimSlashes(pathname).split('/');
  const [locale, ...rest] = segments;
  if (!LOCALES.includes(locale) || rest.length === 0) return null;

  const slug = rest.join('/');
  const page = findPageBySlug(slug);
  if (!page || page.slugs[locale] === slug) return null;

  return joinLocalized(locale, page.slugs[locale]);
}
