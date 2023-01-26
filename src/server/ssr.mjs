import { renderToString } from '@vue/server-renderer'
import build from '/src/app.mjs'

const render = async({ db, req, template }) => {

    const { app, router, store } = build()

    await router.push(req.originalUrl)
    await router.isReady()

    const ctx = {}
    const { currentRoute } = router
    const html = await renderToString(app, ctx)

    const components = currentRoute.value.matched.reduce((array, route) => {
        return array.concat(route.components)
    }, [])

    const paths = components.reduce((array, component) =>
        [...array, component.default.__file]
    , ['/home/christophe/workspace/e-xode.vue-ssr/src/app.vue'])

    return {
        html: template.replace(`<!--app-html-->`, html),
        paths
    }
}

export {
    render
}
