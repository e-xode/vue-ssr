import { renderToString } from '@vue/server-renderer'
import build from '/src/app.mjs'

const render = async({ db, req, template }) => {

    const { app, router, store } = build()

    await router.push(req.originalUrl)
    await router.isReady()

    const ctx = {}
    const html = await renderToString(app, ctx)

    return {
        ctx,
        html: template.replace(`<!--app-html-->`, html)
    }
}

export {
    render
}
