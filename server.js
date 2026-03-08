import fs from 'node:fs/promises'
import cors from 'cors'
import helmet from 'helmet'
import express from 'express'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import { logInfo, logWarn } from '#src/shared/log.js'
import { mongoConnect } from '#src/shared/mongo.js'
import { registerApiRoutes } from '#src/api/router.js'

const { db, error } = await mongoConnect()
if (db && !error) {

  const isProduction = process.env.NODE_ENV === 'production'
  const port = process.env.NODE_PORT || 3002
  const base = process.env.BASE || '/'
  const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : ''
  const fileStore = sessionFileStore(session)

  if (isProduction) {
    try {
      const files = await fs.readdir('logs/sessions')
      await Promise.all(files.map(f => fs.unlink(`logs/sessions/${f}`).catch(() => {})))
    } catch {
      // logs/sessions directory may not exist yet
    }
  }

  if (isProduction && (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET === 'change-me-in-production')) {
    logWarn('COOKIE_SECRET is not set or uses the default value. Server cannot start in production without a secure secret.')
    process.exit(1)
  }

  const sessionMiddleware = session({
    store: new fileStore({ path: 'logs/sessions' }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: true,
      path: '/'
    },
    name: 'app.sid',
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET || 'change-me-in-production'
  })

  const app = express()
  app.set('trust proxy', 1)

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...(isProduction ? [] : ['ws://localhost:*'])],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }))

  app.use(sessionMiddleware)
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        `http://localhost:${port}`,
        process.env.NODE_HOST
      ].filter(Boolean)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS not allowed'))
      }
    },
    credentials: true
  }))

  app.use(express.json())

  app.get('/sitemap.xml', (req, res) => {
    const siteUrl = (process.env.NODE_HOST || `http://localhost:${port}`).replace(/\/$/, '')
    const locales = ['en', 'fr']
    const publicPaths = ['', '/contact']

    const urls = publicPaths.map(path => {
      const links = locales.map(l =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}/${l}${path}"/>`
      ).join('\n')
      return locales.map(l => `  <url>
    <loc>${siteUrl}/${l}${path}</loc>
${links}
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')
    }).join('\n')

    res.set('Content-Type', 'application/xml')
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`)
  })

  app.get('/robots.txt', (req, res) => {
    const siteUrl = (process.env.NODE_HOST || `http://localhost:${port}`).replace(/\/$/, '')
    res.set('Content-Type', 'text/plain')
    res.send(`User-agent: *
Allow: /

Disallow: /api/
Disallow: /*/signup
Disallow: /*/signin
Disallow: /*/forgot-password
Disallow: /*/reset-password
Disallow: /*/auth/
Disallow: /*/dashboard
Disallow: /*/account
Disallow: /*/admin/

Sitemap: ${siteUrl}/sitemap.xml`)
  })

  registerApiRoutes(app, db)

  let vite
  if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }

  app.use('*all', async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, '/')
      let template
      let render
      if (!isProduction) {
        template = await fs.readFile('./index.html', 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        template = templateHtml
        render = (await import('./dist/server/entry-server.js')).render
      }
      const rendered = await render(url)
      const html = template
        .replace(`<!--app-lang-->`, rendered.locale || 'en')
        .replace(`<!--app-head-->`, rendered.head ?? '')
        .replace(`<!--app-html-->`, rendered.html ?? '')

      res.status(rendered.statusCode || 200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.listen(port, () => {
    logInfo(`Server running at http://localhost:${port}`)
  })
} else {
  logWarn(`Database connection failed: ${error}`)
  process.exit(1)
}
