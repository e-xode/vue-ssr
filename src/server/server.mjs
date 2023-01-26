import compression from 'compression'
import express from 'express'
import fs from 'fs'
import http from 'http'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import sharedsession from "express-socket.io-session"
import { createServer } from 'vite'
import { Server } from 'socket.io'

import { cssModules, cssExtract } from './shared/css.mjs'
import { log } from './shared/log.mjs'
import { mongo } from './shared/db.mjs'
import { socket } from './socket/socket.mjs'

import { APP_PORT, IS_PROD, VITE_OPTS } from './shared/constant.mjs'

mongo(async (db, err) => {
    if (!db || err) {
        log('db error, process exit')
        return process.exit()
    }
    const app = express()
    const httpServer = http.Server(app)
    const io = new Server(httpServer, { cors: { origin: '*' }})
    const fileStore = sessionFileStore(session)
    const sessionMiddleware = session({
        store: new fileStore({ path: 'data/tmp' }),
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        secret: 'e-xode.vue-ssr',
        resave: true,
        saveUninitialized: true
    })
    const vite = IS_PROD
        ? null
        : await createServer(VITE_OPTS)
    const index = IS_PROD
        ? fs.readFileSync('/app/dist/client/index.html', 'utf-8')
        : fs.readFileSync('./src/index.html', 'utf-8')
    if (!IS_PROD) {
        app.use(vite.middlewares)
    }
    app.use(express.static('/app/dist/client', { index: '_' }))
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(sessionMiddleware)
    app.use('*', async (req, res) => {
        try {
            const template = IS_PROD
                ? index
                : await vite.transformIndexHtml(req.originalUrl, index)

            const { render } = IS_PROD
                ? await import('/app/dist/server/ssr.js')
                : await vite.ssrLoadModule('/src/server/ssr.mjs')

            const { html, paths } = await render({ db, req, template })
            const css = !IS_PROD
                ? cssExtract(cssModules(paths, vite))
                : ''
            res
                .status(200)
                .set({ 'Content-Type': 'text/html' })
                .end(html.replace('<!--dev-css-->', css))

        } catch (e) {
            if (!IS_PROD) {
                vite.ssrFixStacktrace(e)
            }
            res.status(500).end(e.stack)
        }
    })
    io.use(sharedsession(sessionMiddleware))
    socket({ db, io})
    httpServer.listen(APP_PORT)
    log(`http://localhost:${APP_PORT}`)
})
