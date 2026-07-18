import './style.css';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';
import { escapeHtml } from './shared/utils';
import { LOCALE_CODES, getOgLocale } from './shared/const';

export async function render(url, db, theme) {
  const { app, router, i18n } = createApp(theme);

  await router.push(url);
  await router.isReady();

  const route = router.currentRoute.value;
  const locale = route.params.locale || 'en';
  i18n.global.locale.value = locale;

  const t = i18n.global.t;

  const html = await renderToString(app);
  const head = generateHead(route, locale, t, theme);

  return { html, head, locale, statusCode: route.meta?.statusCode || 200 };
}

function buildHeadContext(route, locale, t, theme) {
  const siteUrl = (process.env.NODE_HOST || 'http://localhost:3002').replace(/\/$/, '');
  const appName = process.env.APP_NAME || 'App';
  const is404 = route.meta?.statusCode === 404;
  const canonical = `${siteUrl}${route.path}`;

  const pageMeta = resolvePageMeta(route, t);
  const title = pageMeta.title ? `${pageMeta.title} — ${appName}` : appName;

  return {
    siteUrl,
    appName,
    is404,
    canonical,
    locale,
    robots: route.meta?.robots || 'index, follow',
    title,
    description: pageMeta.description || '',
    keywords: pageMeta.keywords || '',
    ogImage: `${siteUrl}/og-image.png`,
    ogUrl: is404 ? siteUrl : canonical,
    pathWithoutLocale: route.path.replace(/^\/[a-z]{2}(\/|$)/, '/'),
    fbAppId: process.env.FACEBOOK_APP_ID || '',
    themeColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
    schemaOrg: getSchemaMarkup(route, {
      siteUrl,
      appName,
      description: pageMeta.description || '',
      locale,
    }),
  };
}

function buildConditionalTags(ctx) {
  const altLocales = LOCALE_CODES.filter((l) => l !== ctx.locale);

  return {
    keywords: ctx.keywords ? `<meta name="keywords" content="${escapeHtml(ctx.keywords)}">` : '',
    canonical: ctx.is404 ? '' : `<link rel="canonical" href="${ctx.canonical}">`,
    hreflang: ctx.is404
      ? ''
      : LOCALE_CODES.map(
          (l) =>
            `<link rel="alternate" hreflang="${l}" href="${ctx.siteUrl}/${l}${ctx.pathWithoutLocale}">`
        ).join('\n'),
    xDefault: ctx.is404
      ? ''
      : `<link rel="alternate" hreflang="x-default" href="${ctx.siteUrl}/en${ctx.pathWithoutLocale}">`,
    ogAlt: ctx.is404
      ? ''
      : altLocales
          .map((l) => `<meta property="og:locale:alternate" content="${getOgLocale(l)}">`)
          .join('\n'),
    fbAppId: ctx.fbAppId ? `<meta property="fb:app_id" content="${ctx.fbAppId}">` : '',
  };
}

function generateHead(route, locale, t, theme) {
  const ctx = buildHeadContext(route, locale, t, theme);
  const tags = buildConditionalTags(ctx);

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${escapeHtml(ctx.description)}">
${tags.keywords}
<meta name="robots" content="${ctx.robots}">
<meta name="theme-color" content="${ctx.themeColor}">
<meta name="revisit-after" content="7 days">
<meta name="author" content="${escapeHtml(ctx.appName)}">
<title>${escapeHtml(ctx.title)}</title>
${tags.canonical}
${tags.hreflang}
${tags.xDefault}
<meta property="og:title" content="${escapeHtml(ctx.title)}">
<meta property="og:description" content="${escapeHtml(ctx.description)}">
<meta property="og:url" content="${ctx.ogUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(ctx.appName)}">
<meta property="og:image" content="${ctx.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(ctx.title)}">
<meta property="og:locale" content="${getOgLocale(ctx.locale)}">
${tags.ogAlt}
${tags.fbAppId}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ctx.title)}">
<meta name="twitter:description" content="${escapeHtml(ctx.description)}">
<meta name="twitter:image" content="${ctx.ogImage}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${escapeHtml(ctx.appName)}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="icon" href="/favicon.ico">
<link rel="manifest" href="/manifest.json">
${ctx.schemaOrg}`;
}

function resolvePageMeta(route, t) {
  const titleKey = route.meta?.title;
  const descKey = route.meta?.description;
  return {
    title: titleKey ? t(titleKey) : '',
    description: descKey ? t(descKey) : '',
    keywords: route.meta?.keywords ? t(route.meta.keywords) : '',
  };
}

function getSchemaMarkup(route, { siteUrl, appName, description, locale }) {
  const schemas = [];

  if (route.meta?.robots?.includes('noindex')) return '';

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      process.env.SOCIAL_FACEBOOK,
      process.env.SOCIAL_INSTAGRAM,
      process.env.SOCIAL_TELEGRAM,
    ].filter(Boolean),
  };
  schemas.push(orgSchema);

  if (route.name === 'Index' || route.name === 'Home') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: appName,
      url: siteUrl,
      description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  const breadcrumbs = generateBreadcrumbs(route, siteUrl, locale);
  if (breadcrumbs.length > 1) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  return schemas
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n');
}

function generateBreadcrumbs(route, siteUrl, locale) {
  const base = `${siteUrl}/${locale}`;
  const crumbs = [{ name: 'Home', url: base }];

  const pathParts = route.path
    .replace(/^\/[a-z]{2}/, '')
    .split('/')
    .filter(Boolean);
  if (pathParts.length > 0) {
    let currentPath = base;
    for (const part of pathParts) {
      currentPath += `/${part}`;
      crumbs.push({
        name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
        url: currentPath,
      });
    }
  }

  return crumbs;
}
