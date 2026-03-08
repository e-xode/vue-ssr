import './style.css'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import { escapeHtml } from './shared/utils'
import { LOCALE_CODES, getOgLocale } from './shared/const'

export async function render(url) {
    const { app, router, i18n } = createApp()

    await router.push(url)
    await router.isReady()

    const route = router.currentRoute.value
    const locale = route.params.locale || 'en'
    i18n.global.locale.value = locale

    const html = await renderToString(app)
    const head = generateHead(route, locale, i18n)

    return { html, head, locale, statusCode: route.meta?.statusCode || 200 }
}

function generateHead(route, locale, i18n) {
    const siteUrl = process.env.NODE_HOST || 'http://localhost:5173'
    const appName = process.env.APP_NAME || 'App'
    const canonical = `${siteUrl}${route.path}`
    const robots = route.meta?.robots || 'index, follow'

    const pageMeta = resolvePageMeta(route, i18n)
    const title = pageMeta.title ? `${pageMeta.title} — ${appName}` : appName
    const description = pageMeta.description || ''
    const ogImage = `${siteUrl}/og-image.png`

    const pathWithoutLocale = route.path.replace(`/${locale}`, '')
    const hreflangTags = LOCALE_CODES.map(l =>
        `<link rel="alternate" hreflang="${l}" href="${siteUrl}/${l}${pathWithoutLocale}">`
    ).join('\n')
    const altLocales = LOCALE_CODES.filter(l => l !== locale)
    const ogAltTags = altLocales.map(l =>
        `<meta property="og:locale:alternate" content="${getOgLocale(l)}">`
    ).join('\n')

    const schemaOrg = generateSchemaOrg(route, siteUrl, appName, title, description)

    return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#2563eb">
<meta name="revisit-after" content="7 days">
<meta name="author" content="${escapeHtml(appName)}">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${canonical}">
${hreflangTags}
<link rel="alternate" hreflang="x-default" href="${siteUrl}/en${pathWithoutLocale}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(appName)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:alt" content="${escapeHtml(title)}">
<meta property="og:locale" content="${getOgLocale(locale)}">
${ogAltTags}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="manifest" href="/manifest.json">
${schemaOrg}`
}

function resolvePageMeta(route, i18n) {
    const t = i18n.global.t
    const titleKey = route.meta?.title
    const descKey = route.meta?.description
    return {
        title: titleKey ? t(titleKey) : '',
        description: descKey ? t(descKey) : ''
    }
}

function generateSchemaOrg(route, siteUrl, appName, title, description) {
    if (route.meta?.robots?.includes('noindex')) return ''

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: appName,
        url: siteUrl,
        description,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    }

    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
