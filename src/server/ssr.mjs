import { renderToString } from '@vue/server-renderer'
import build from '#src/app.mjs'

const render = async({ db, req, template }) => {

    const { app, router, store } = build()
    const ctx = {}

    await router.push(req.originalUrl)
    await router.isReady()

    const html = await renderToString(app, ctx)
    const { currentRoute } = router
    const { description, title, keywords } = store.getters['metas/get']
    const state = encodeURIComponent(JSON.stringify(store.state))

    const components = currentRoute.value.matched.reduce((array, route) => {
        return array.concat(route.components)
    }, [])

    const paths = components.reduce((array, component) =>
        [...array, component.default.__file]
    , ['/app/src/app.vue'])

    return {
        html: template.replace(
            `<!--app-html-->`,
            html
        ).replace(
            /(<!--store-->)*(<!--store-->)/,
            `<!--store-->
                <script>
                    __INITIAL_STATE__="${state}"
                </script>
            <!--store-->`
        ).replace(
            /(<!--meta-->)*(<!--meta-->)/,
            `<!--meta-->
                <meta name="description" content="${description}" />
                <meta name="keywords" content="${keywords}" />
                <title>${title}</title>
            <!--meta-->`
        ),
        paths
    }
}

export {
    render
}
