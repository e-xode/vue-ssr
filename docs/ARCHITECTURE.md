# Architecture

One Node.js process serves everything: the REST API, the server-rendered pages and, in production,
the static files.

```
Browser ──▶ Express 5 (server.js)
              ├─ Helmet (CSP)            src/api/http/hardening.js
              ├─ /healthz                src/api/http/readiness.js
              ├─ static files (prod)     src/api/http/static.js
              ├─ rate limits (prod)      src/api/http/hardening.js
              ├─ sitemap.xml, robots.txt src/api/http/seo.js
              ├─ session, CORS, JSON     src/api/http/session.js
              ├─ /api/*                  src/api/router.js  ──▶ MongoDB
              ├─ locale redirects        src/api/http/redirects.js
              └─ SSR catch-all           src/api/http/ssr.js ──▶ src/entry-server.js
```

`server.js` only wires these modules together. Each concern is a small module in `src/api/http/`
with its own unit tests.

## Request lifecycle of a page

1. `redirectMiddleware` answers `/` with a 302 to `/{locale}` chosen from `Accept-Language`, and
   301s non-canonical localized paths.
2. The SSR handler reads the `theme` cookie and calls `render(url, db, theme)` from
   `src/entry-server.js`.
3. `render` creates a fresh application (`createApp` in `src/main.js`: Vue, router, Pinia, i18n,
   Vuetify), navigates to the URL, runs the optional `route.meta.prefetch`, and renders to a string.
   When the router resolved the URL through a route-level `redirect`, the server answers 302 to
   the target instead of rendering.
4. `src/ssr/head.js` builds the head: title, description, canonical, `hreflang`, Open Graph and
   JSON-LD. Pages answered with 404 or 410, and routes with `requiresAuth` or `requiresAdmin`, are
   always `noindex` and carry no canonical link.
5. The handler fills the markers of `index.html` (`<!--app-head-->`, `<!--app-html-->`,
   `<!--app-state-->`…) and sends the page with the status the render reported.
6. In the browser, `src/entry-client.js` restores the Pinia state embedded in the page and
   hydrates.

A view sets a status code with `useSsrStatus().setStatusCode(404)`; the catch-all route sets 404
through `meta.statusCode`.

## Routing and locales

Every page lives under `/:locale(en|fr)/…`. The locale comes from the URL only.

- Routes are declared in `src/router.js`; localized slugs in `src/shared/localizedRoutes.js`.
- Links always go through `useLocalePath()`: `localePath('/contact')` and `switchLocale('fr')`.
- Route `meta` drives the layout (`public`, `minimal`, `app`), the guards (`requiresAuth`,
  `requiresAdmin`, `guest`) and the SEO texts (`title`, `description`, `robots`).
- Navigation guards run in the browser only; the API enforces access on the server.

## Server and client code

| Location                                | Runs on        | Notes                                              |
| --------------------------------------- | -------------- | -------------------------------------------------- |
| `server.js`, `src/api/**`               | Server         | Imports use the `#src/…` alias                     |
| `src/shared/**`                         | Both or server | Server-only modules must never be imported by views |
| `src/views`, `components`, `composables`, `stores` | Both (SSR + browser) | Imports use the `@/…` alias; guard browser APIs |

Server-only shared modules: `mongo.js`, `dbHelpers.js`, `email.js`, `security.js`, `captcha.js`,
`logger.js`, `sitemap.js`. The production build fails when client code imports one of them.

## Data

MongoDB through the official driver, one pooled client (`src/shared/mongo.js`), injected into
every route as `db`.

| Collection   | Content                                                    | Indexes                                   |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- |
| `users`      | Account, password hash, pending codes, login history       | `email` unique                            |
| `blockedIps` | Blocked addresses with a reason                            | `ip` unique                               |
| `logs`       | Audit events (`event`, `userId`, `ip`, `meta`, `createdAt`) | `event`, `userId`, `createdAt` (TTL 90 days) |

Indexes are ensured at startup (`src/api/http/indexes.js`); a failure is logged as a warning and
does not stop the server. Sessions are files under `logs/sessions/`, uploads are files under
`public/uploads/`.

## Development and production

|              | Development (`npm run dev`)                         | Production (`npm run build`, `npm start`)        |
| ------------ | --------------------------------------------------- | ------------------------------------------------ |
| Vue and SSR  | Loaded per request through Vite, with HMR           | Prebuilt bundles in `dist/client`, `dist/server` |
| API routes   | Reloaded per request through Vite                   | Imported once                                    |
| Static files | Served by Vite                                      | Served by `sirv` with long-lived caching         |
| Rate limits  | Off                                                 | On                                               |
| reCAPTCHA    | Skipped                                             | Enforced                                         |
| Emails       | Console when `MAILER_HOST` is unset                 | SMTP                                             |
| CSP          | Allows inline and eval scripts for HMR              | No `unsafe-inline` scripts                       |

Editing `server.js` restarts the dev server. Edits under `src/api/http/` need a manual restart.

## Shutdown and health

`GET /healthz` answers 200 once the server listens and 503 while it starts or stops. On `SIGTERM`
or `SIGINT` the server stops accepting connections, waits for in-flight requests, closes MongoDB
and exits (forced after 10 seconds). A listen error, such as a port already in use, exits with a
non-zero code.
