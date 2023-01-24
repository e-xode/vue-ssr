import compression from 'compression'
import express from 'express'
import fs from 'fs'
import http from 'http'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import sharedsession from "express-socket.io-session"
import { createServer } from 'vite'
import { Server } from 'socket.io'

import { log, mongo } from './shared/index.mjs'
import { socket } from './socket/socket.mjs'

const { APP_PORT = 3002, NODE_ENV } = process.env
const isProd = NODE_ENV !== 'development'

mongo(async (db, err) => {
    if (!db || err) {
        log('db failed, server exiting')
        process.exit()
    } else {
        const app = express()
        const fileStore = sessionFileStore(session)
        const sessionMiddleware = session({
            store: new fileStore({ path: 'data/tmp' }),
            cookie: { maxAge: 24 * 60 * 60 * 1000 },
            secret: 'e-xode.vue-ssr',
            resave: true,
            saveUninitialized: true
        })
        const io = new Server(http.Server(app), {
            cors: { origin: '*' }
        })
        io.use(sharedsession(sessionMiddleware))
        app.use(express.static('/app/dist/client', { index: '_' }))
        app.use(compression())
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(sessionMiddleware)
        socket({ io, db })

        const vite = isProd
            ? null
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
            ? fs.readFileSync('/app/dist/client/index.html', 'utf-8')
            : fs.readFileSync('./src/index.html', 'utf-8')

        app.get('/favicon.ico', (_, res) => res.status(200).send())
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
                    ? await import('/app/dist/server/ssr.js')
                    : await vite.ssrLoadModule('/src/server/ssr.mjs')

                const { html } = await render({ template, manifest, req, vite })
                res
                    .status(200)
                    .set({ 'Content-Type': 'text/html' })
                    .end(html)

            } catch (e) {
                if (!isProd) {
                    vite.ssrFixStacktrace(e)
                }
                res.status(500).end(e.toString())
            }
        })
        app.listen(APP_PORT)
        log(`http://localhost:${APP_PORT}`)
    }
})
