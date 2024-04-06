import { renderToString } from '@vue/server-renderer'
import { route } from '#src/server/routing.mjs'
import mount from '#src/app.mjs'

const render = async({ db, req, res, template }) => {
    const defaultLocale = req.session.locale
        ? req.session.locale
        : req.acceptsLanguages()[0]
    const locale = ['en'].includes(defaultLocale)
        ? defaultLocale
        : 'en'
    req.session.locale = locale
    await req.session.save()

    const { app, router, store } = mount(locale)
    // store.commit('metas/setTitle', 'test')
    store.commit('user/setLocale', locale)

    await router.push(req.originalUrl)
    await router.isReady()
    await route({ db, req, res, router, store })

    const html = await renderToString(app, {})
    const { currentRoute } = router
    const state = encodeURIComponent(JSON.stringify(store.state))

    const views = currentRoute.value.matched.reduce((array, route) => {
        return array.concat(route.components)
    }, [])

    const paths = views.reduce((array, component) =>
    [...array, component.default.__file]
    , ['/app/src/app.vue'])

    const baseurl = process.env.NODE_HOST
    const {
        description,
        image,
        title,
        keywords
    } = store.getters['metas/metas']

    return {
        html: template.replace(
            '<!--app-html-->',
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
                <meta name="title" content="${title}" />
                <meta name="description" content="${description}" />
                <meta name="keywords" content="${keywords}" />
                <title>${title}</title>
                <meta property="fb:app_id" content="740649651165001" />
                <meta property="og:title" content="${title}" />
                <meta property="og:description" content="${description}" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="${baseurl}${req.originalUrl}" />
                <meta property="og:image" content="${baseurl}${image}" />
                <meta property="og:locale" content="${store.getters['user/locale']}" />
            <!--meta-->`
        ),
        paths
    }
}

export {
    render
}
