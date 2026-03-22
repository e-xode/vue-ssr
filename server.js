import fs from 'node:fs/promises'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import express from 'express'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
import { logInfo, logWarn } from '#src/shared/log.js'
import { mongoConnect, mongoClose } from '#src/shared/mongo.js'
import { registerApiRoutes } from '#src/api/router.js'
import { LOCALE_CODES } from '#src/shared/const.js'

async function ensureIndexes(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('blockedIps').createIndex({ ip: 1 }, { unique: true })
  await db.collection('logs').createIndex({ createdAt: -1 })
  await db.collection('logs').createIndex({ event: 1 })
}

const { db, error } = await mongoConnect()
if (db && !error) {
  await ensureIndexes(db)

  const isProduction = process.env.NODE_ENV === 'production'
  const port = process.env.NODE_PORT || 5173
  const base = process.env.BASE || '/'
  const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : ''

  if (isProduction) {
    const sessionDir = 'logs/sessions'
    const files = await fs.readdir(sessionDir).catch(() => [])
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(`${sessionDir}/${file}`).catch(() => {})
      }
    }
    logInfo(`Cleared ${files.filter(f => f.endsWith('.json')).length} session(s)`)
  }

  if (isProduction && !process.env.COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET environment variable is required in production')
  }

  const fileStore = sessionFileStore(session)

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
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "https://www.googletagmanager.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://www.google-analytics.com", "https://region1.google-analytics.com", "https://www.googletagmanager.com"],
        frameSrc: ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    } : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }))

  if (isProduction) {
    app.use('/api/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'error.rateLimit' }
    }))
  }

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

  const SITEMAP_TTL = 60 * 60 * 1000
  let sitemapCache = { xml: '', generatedAt: 0 }

  function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  }

  function toDateStr(date) {
    return date ? new Date(date).toISOString().split('T')[0] : null
  }

  async function generateSitemap() {
    const siteUrl = (process.env.NODE_HOST || `http://localhost:${port}`).replace(/\/$/, '')
    const locales = LOCALE_CODES
    const now = toDateStr(new Date())
    const publicPaths = ['', '/contact']

    const hreflangLinks = (path) => locales.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}/${l}${path}"/>`
    ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/${locales[0]}${path}"/>`

    const urlBlock = (url, path, lastmod, changefreq, priority) =>
      `  <url>\n    <loc>${escapeXml(url)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      hreflangLinks(path) + '\n' +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n  </url>\n`

    let urls = ''

    for (const path of publicPaths) {
      for (const locale of locales) {
        urls += urlBlock(
          `${siteUrl}/${locale}${path}`,
          path, now, 'weekly', path === '' ? '1.0' : '0.8'
        )
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}</urlset>`
  }

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const now = Date.now()
      if (!sitemapCache.xml || now - sitemapCache.generatedAt > SITEMAP_TTL) {
        sitemapCache = { xml: await generateSitemap(), generatedAt: now }
      }
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'Last-Modified': new Date(sitemapCache.generatedAt).toUTCString()
      }).send(sitemapCache.xml)
    } catch (err) {
      console.error('Sitemap error:', err)
      res.status(500).end()
    }
  })

  app.get('/robots.txt', (req, res) => {
    const siteUrl = (process.env.NODE_HOST || `http://localhost:${port}`).replace(/\/$/, '')
    res.set('Content-Type', 'text/plain')
    res.send(`User-agent: *
Allow: /

Disallow: /api/
Disallow: /*/signup
Disallow: /*/signin
Disallow: /*/auth/verify-code
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
      const rendered = await render(url, db)

      const gaId = process.env.GA_MEASUREMENT_ID || ''
      const gaScript = gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');</script>` : ''

      const recaptchaKey = process.env.RECAPTCHA_SITE_KEY || ''
      const recaptchaScript = recaptchaKey ? `<script>window.__RECAPTCHA_SITE_KEY__='${recaptchaKey}';</script>` : ''

      const html = template
        .replace(`<!--app-lang-->`, rendered.locale || 'en')
        .replace(`<!--app-head-->`, gaScript + recaptchaScript + (rendered.head ?? ''))
        .replace(`<!--app-html-->`, rendered.html ?? '')

      res.status(rendered.statusCode || 200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
      vite?.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).end(isProduction ? 'Internal Server Error' : e.stack)
    }
  })

  const server = app.listen(port, () => { logInfo(`Server started at http://localhost:${port}`) })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logWarn(`Port ${port} already in use`)
    } else {
      throw err
    }
  })

  async function shutdown() {
    logInfo('Shutting down...')
    await mongoClose()
    process.exit(0)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
} else {
  logWarn(`Database connection failed: ${error}`)
  process.exit(1)
}
