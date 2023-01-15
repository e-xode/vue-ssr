import fs from 'fs'
import https from 'https'
import http from 'http'
import express from 'express'
import compression from 'compression'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import { createServer } from 'vite'

const isProd = process.env.NODE_ENV !== 'development'

const boot = async() => {
    const app = express()
    const appStatic = express()
    const fileStore = sessionFileStore(session)
    const sessionMiddleware = session({
        store: new fileStore({ path: `./data/tmp` }),
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        secret: 'e-xode.vue-ssr',
        resave: true,
        saveUninitialized: true
    })

    app.use(express.static('dist'))
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(sessionMiddleware)

    appStatic.use(express.static('dist'))
    appStatic.use(compression())
    appStatic.use(express.json())
    appStatic.use(express.urlencoded({ extended: true }))

    const key = isProd
        ? fs.readFileSync(`./ssl/server.key`)
        : null
    const cert = isProd
        ? fs.readFileSync(`./ssl/server.cert`)
        : null

    const httpsServer = isProd
        ? https.Server({ cert, key }, app)
        : http.Server(app)
    const httpServer = http.Server(appStatic)

    const vite = isProd
        ? false
        : await createServer({
                appType: 'custom',
                config: '',
                base: '/',
                logLevel: 'info',
                root: process.cwd(),
                server: {
                    middlewareMode: true,
                    watch: {
                        usePolling: true,
                        interval: 100
                    }
                }
            })
    if (!isProd) {
        app.use(vite.middlewares)
    }
    const index = isProd
        ? fs.readFileSync('./dist/index.html', 'utf-8')
        : fs.readFileSync('./src/index.html', 'utf-8')

    app.get('/favicon.ico', (req, res) => res.status(200).send())
    app.use('*', async (req, res) => {
        const manifest = {}
        try {
            if (req.originalUrl === '/favicon.ico') {
                res.status(200).end()
            }
            const template = isProd
                ? index
                : await vite.transformIndexHtml(req.originalUrl, index)
            const { render } = isProd
                ? await vite.ssrLoadModule('./dist/server/render.mjs')
                : await vite.ssrLoadModule('/src/server/render.mjs')

            const { html } = await render({
                template,
                manifest,
                req,
                vite
            })
            res
                .status(200)
                .set({ 'Content-Type': 'text/html' })
                .end(html)
        } catch (e) {
            if (!isProd) {
                vite.ssrFixStacktrace(e)
            }
            res.status(500).end(e.stack)
        }
      })
      return { httpsServer }
}
boot().then(({ httpServer, httpsServer }) => {
    if (isProd) {
        httpServer.listen(80)
        httpsServer.listen(443)
    } else {
        httpsServer.listen(3002)
    }
})
