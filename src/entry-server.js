import './style.css'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(url) {
    const { app, router, i18n } = createApp()

    await router.push(url)
    await router.isReady()

    const route = router.currentRoute.value
    const locale = route.params.locale || 'en'
    i18n.global.locale.value = locale

    const html = await renderToString(app)
    const head = generateHead(route, locale)

    return { html, head, locale }
}

function generateHead(route, locale) {
    const siteUrl = process.env.NODE_HOST || 'http://localhost:5173'
    const appName = process.env.APP_NAME || 'App'
    const canonical = `${siteUrl}${route.path}`
    const robots = route.meta?.robots || 'index, follow'

    const pageMeta = resolvePageMeta(route)
    const title = pageMeta.title ? `${pageMeta.title} — ${appName}` : appName
    const description = pageMeta.description || ''
    const ogImage = `${siteUrl}/og-image.png`

    const altLocale = locale === 'fr' ? 'en' : 'fr'
    const altPath = route.path

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
<link rel="alternate" hreflang="${locale}" href="${siteUrl}${route.path}">
<link rel="alternate" hreflang="${altLocale}" href="${siteUrl}${altPath}">
<link rel="alternate" hreflang="x-default" href="${siteUrl}${route.path}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(appName)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:alt" content="${escapeHtml(appName)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/favicon.ico">
<link rel="manifest" href="/manifest.json">
${schemaOrg}`
}

function resolvePageMeta(route) {
    return {
        title: route.meta?.title || '',
        description: route.meta?.description || ''
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

function escapeHtml(text) {
    if (!text) return ''
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}
