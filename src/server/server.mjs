import compression from 'compression'
import express from 'express'
import fs from 'fs'
import http from 'http'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import sharedsession from "express-socket.io-session"
import { Server } from 'socket.io'

import { cssModules, cssExtract } from '#src/server/shared/css.mjs'
import { log } from '#src/server/shared/log.mjs'
import { mongo } from '#src/server/shared/db.mjs'
import { socket } from '#src/server/socket/socket.mjs'

import {
    IS_PROD,
    NODE_PORT,
    VITE_OPTS
} from '#src/server/shared/constant.mjs'

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
        store: new fileStore({ path: '/app/data/tmp' }),
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        secret: 'e-xode.vue-ssr',
        resave: true,
        saveUninitialized: true
    })
    const vite = IS_PROD
        ? null
        : await import('vite').then(({ createServer }) => createServer(VITE_OPTS))
    const index = IS_PROD
        ? fs.readFileSync('/app/dist/client/index.html', 'utf-8')
        : fs.readFileSync('/app/src/index.html', 'utf-8')
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
                .end(html.replace(
                    /(<!--css-->)*(<!--css-->)/,
                    `<!--css-->${css}<!--css-->`
                ))

        } catch (e) {
            if (!IS_PROD) {
                vite.ssrFixStacktrace(e)
            }
            res.status(500).end(e.stack)
        }
    })
    io.use(sharedsession(sessionMiddleware))
    socket({ db, io})
    httpServer.listen(NODE_PORT)
    log(`http://localhost:${NODE_PORT}`)
})
