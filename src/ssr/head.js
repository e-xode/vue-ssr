import { escapeHtml } from '@/shared/utils';
import { LOCALE_CODES, DEFAULT_LOCALE, getOgLocale } from '@/shared/const';
import { localizeSubPath } from '@/shared/localizedRoutes';
import { buildTitle } from '@/shared/title';
import { serializeForScript } from '@/shared/serialize';
import { resolveSiteUrl } from '@/shared/siteUrl';
import {
  GA_ID_META_NAME,
  GA_ID_PATTERN,
  RECAPTCHA_SITE_KEY_META_NAME,
} from '@/shared/clientConstants';
import {
  SITE_IMAGE_PATH,
  SITE_LOGO_PATH,
  FAVICON_LINKS,
  MANIFEST_PATH,
  DEFAULT_APP_NAME,
  LIGHT_THEME_COLOR,
  DARK_THEME_COLOR,
  RECAPTCHA_SITE_KEY_PATTERN,
} from '@/shared/seoConstants';

function stripLocalePrefix(path) {
  const prefix = LOCALE_CODES.find((code) => path === `/${code}` || path.startsWith(`/${code}/`));
  return prefix ? path.slice(prefix.length + 1) : path;
}

function resolvePageMeta(route, t) {
  const { title, description, keywords } = route.meta ?? {};
  return {
    title: title ? t(title) : '',
    description: description ? t(description) : '',
    keywords: keywords ? t(keywords) : '',
  };
}

function resolveBreadcrumbName(resolved, t) {
  const { title, statusCode } = resolved.meta ?? {};
  return title && !statusCode ? t(title) : null;
}

export function buildBreadcrumbs({ route, router, siteUrl, locale, t }) {
  const crumbs = [{ name: t('nav.home'), url: `${siteUrl}/${locale}` }];
  const parts = stripLocalePrefix(route.path).split('/').filter(Boolean);
  let currentPath = `/${locale}`;
  for (const part of parts) {
    currentPath += `/${part}`;
    const name = resolveBreadcrumbName(router.resolve(currentPath), t);
    if (name) crumbs.push({ name, url: `${siteUrl}${currentPath}` });
  }
  return crumbs;
}

function jsonLdScript(schema) {
  return `<script type="application/ld+json">${serializeForScript(schema)}</script>`;
}

export function getSchemaMarkup(ctx) {
  if (ctx.robots.includes('noindex')) return '';

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: ctx.appName,
      url: ctx.siteUrl,
      logo: ctx.logoUrl,
      sameAs: ctx.socialLinks,
    },
  ];

  if (ctx.isHome) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: ctx.appName,
      url: ctx.siteUrl,
      description: ctx.description,
    });
  }

  if (ctx.breadcrumbs.length > 1) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: ctx.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  return schemas.map(jsonLdScript).join('\n');
}

function readIntegrations(env) {
  const gaId = env.GA_MEASUREMENT_ID || '';
  const recaptchaSiteKey = env.RECAPTCHA_SITE_KEY || '';
  return {
    fbAppId: env.FACEBOOK_APP_ID || '',
    gaId: GA_ID_PATTERN.test(gaId) ? gaId : '',
    recaptchaSiteKey: RECAPTCHA_SITE_KEY_PATTERN.test(recaptchaSiteKey) ? recaptchaSiteKey : '',
    socialLinks: [env.SOCIAL_FACEBOOK, env.SOCIAL_INSTAGRAM, env.SOCIAL_TELEGRAM].filter(Boolean),
  };
}

export function buildHeadContext({ route, router, locale, t, theme, statusCode, env }) {
  const siteUrl = resolveSiteUrl(env);
  const appName = env.APP_NAME || DEFAULT_APP_NAME;
  const is404 = statusCode === 404;
  const canonical = `${siteUrl}${route.path}`;
  const pageMeta = resolvePageMeta(route, t);

  const ctx = {
    siteUrl,
    appName,
    is404,
    canonical,
    locale,
    robots: route.meta?.robots || 'index, follow',
    title: buildTitle(pageMeta.title, appName),
    description: pageMeta.description,
    keywords: pageMeta.keywords,
    imageUrl: `${siteUrl}${SITE_IMAGE_PATH}`,
    logoUrl: `${siteUrl}${SITE_LOGO_PATH}`,
    ogUrl: is404 ? siteUrl : canonical,
    subPath: stripLocalePrefix(route.path),
    ...readIntegrations(env),
    themeColor: theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
    isHome: route.name === 'Index',
    breadcrumbs: buildBreadcrumbs({ route, router, siteUrl, locale, t }),
  };
  return { ...ctx, schemaOrg: getSchemaMarkup(ctx) };
}

function buildAlternateTags(ctx) {
  if (ctx.is404) return [];
  const hreflangLink = (hreflang, locale) =>
    `<link rel="alternate" hreflang="${hreflang}" href="${ctx.siteUrl}/${locale}${localizeSubPath(ctx.subPath, locale)}">`;
  return [
    `<link rel="canonical" href="${escapeHtml(ctx.canonical)}">`,
    ...LOCALE_CODES.map((locale) => hreflangLink(locale, locale)),
    hreflangLink('x-default', DEFAULT_LOCALE),
    ...LOCALE_CODES.filter((locale) => locale !== ctx.locale).map(
      (locale) => `<meta property="og:locale:alternate" content="${getOgLocale(locale)}">`
    ),
  ];
}

function buildIconTags() {
  return [
    ...FAVICON_LINKS.map(({ rel, href, sizes, type }) => {
      const sizesAttr = sizes ? ` sizes="${sizes}"` : '';
      const typeAttr = type ? ` type="${type}"` : '';
      return `<link rel="${rel}"${typeAttr}${sizesAttr} href="${href}">`;
    }),
    `<link rel="manifest" href="${MANIFEST_PATH}">`,
  ];
}

function buildConfigTags(ctx, fontPreloadUrl) {
  return [
    ctx.gaId ? `<meta name="${GA_ID_META_NAME}" content="${escapeHtml(ctx.gaId)}">` : '',
    ctx.recaptchaSiteKey
      ? `<meta name="${RECAPTCHA_SITE_KEY_META_NAME}" content="${escapeHtml(ctx.recaptchaSiteKey)}">`
      : '',
    fontPreloadUrl
      ? `<link rel="preload" as="font" type="font/woff2" href="${escapeHtml(fontPreloadUrl)}" crossorigin>`
      : '',
  ];
}

function buildSocialTags(ctx) {
  const title = escapeHtml(ctx.title);
  const description = escapeHtml(ctx.description);
  return [
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${escapeHtml(ctx.ogUrl)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${escapeHtml(ctx.appName)}">`,
    `<meta property="og:image" content="${escapeHtml(ctx.imageUrl)}">`,
    `<meta property="og:image:alt" content="${title}">`,
    `<meta property="og:locale" content="${getOgLocale(ctx.locale)}">`,
    ctx.fbAppId ? `<meta property="fb:app_id" content="${escapeHtml(ctx.fbAppId)}">` : '',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${escapeHtml(ctx.imageUrl)}">`,
  ];
}

export function generateHead({ fontPreloadUrl, ...contextOptions }) {
  const ctx = buildHeadContext(contextOptions);
  const appName = escapeHtml(ctx.appName);

  return [
    `<meta name="description" content="${escapeHtml(ctx.description)}">`,
    ctx.keywords ? `<meta name="keywords" content="${escapeHtml(ctx.keywords)}">` : '',
    `<meta name="robots" content="${escapeHtml(ctx.robots)}">`,
    `<meta name="theme-color" content="${ctx.themeColor}">`,
    `<meta name="author" content="${appName}">`,
    `<title>${escapeHtml(ctx.title)}</title>`,
    ...buildAlternateTags(ctx),
    ...buildSocialTags(ctx),
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
    `<meta name="apple-mobile-web-app-title" content="${appName}">`,
    ...buildIconTags(),
    ...buildConfigTags(ctx, fontPreloadUrl),
    ctx.schemaOrg,
  ]
    .filter(Boolean)
    .join('\n');
}
