import './style.css'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(url) {
    const { app, router, i18n } = createApp()

    await router.push(url)
    await router.isReady()

    const route = router.currentRoute.value
    i18n.global.locale.value = route.params.locale || 'en'

    const html = await renderToString(app)
    const metaTags = generateMetaTags(route)

    return { html, head: metaTags }
}

function generateMetaTags(route) {
    const siteUrl = process.env.NODE_HOST || 'http://localhost:5173'
    const canonical = `${siteUrl}${route.path}`

    const titles = {
        '/': { title: 'Home', description: 'Welcome' },
    }

    const pageMeta = titles[route.path] || { title: 'App', description: 'Welcome' }
    const robots = route.meta?.robots || 'index, follow'

    return `<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(pageMeta.description)}">
    <meta name="robots" content="${robots}">
    <meta name="theme-color" content="#2563eb">
    <meta name="revisit-after" content="7 days">
    <title>${escapeHtml(pageMeta.title)}</title>
    <link rel="canonical" href="${canonical}">`
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
