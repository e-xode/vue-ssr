import { renderToString } from '@vue/server-renderer'
import build from '/src/app.mjs'

const renderCss = async(vite) => {
    const mod = await vite.moduleGraph.getModuleByUrl('/src/app.vue')
    return mod.ssrTransformResult.deps
        .filter(d => d.endsWith('.scss'))
        .map(url => `<link rel="stylesheet" type="text/css" href="${url}">`)
        .join('')
}

const render = async({ req, template, vite }) => {

    const { router, app, store } = build()

    await router.push(req.originalUrl)
    await router.isReady()

    const ctx = {}
    const html = await renderToString(app, ctx)
    const css = vite
        ? await renderCss(vite)
        : ''
    return {
        html: template
            .replace(`<!--dev-css-->`, css)
            .replace(`<!--app-html-->`, html)
    }
}

export {
    render
}
