export const SITEMAP_CACHE_TTL_MS = 60 * 60 * 1000;

export const SITEMAP_CACHE_MAX_AGE_SECONDS = 60 * 60;

export const ROBOTS_CACHE_MAX_AGE_SECONDS = 24 * 60 * 60;

export const SITEMAP_DEFAULT_CHANGEFREQ = 'weekly';

export const SITEMAP_HOME_PRIORITY = '1.0';

export const SITEMAP_PAGE_PRIORITY = '0.8';

export const SITEMAP_XML_NAMESPACES =
  'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"';

export const X_DEFAULT_HREFLANG = 'x-default';

export const ROBOTS_DISALLOWED_PATHS = [
  '/api/',
  '/*/signup',
  '/*/signin',
  '/*/auth/verify-code',
  '/*/forgot-password',
  '/*/reset-password',
  '/*/auth/',
  '/*/dashboard',
  '/*/account',
  '/*/admin/',
];

export const SITE_IMAGE_PATH = '/og-image.png';
export const SITE_LOGO_PATH = '/icon-512.png';

export const FAVICON_LINKS = [
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'icon', href: '/favicon.png', type: 'image/png' },
];

export const MANIFEST_PATH = '/manifest.json';

export const DEFAULT_APP_NAME = 'App';

export const LIGHT_THEME_COLOR = '#ffffff';

export const DARK_THEME_COLOR = '#0a0a0a';

export const RECAPTCHA_SITE_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
