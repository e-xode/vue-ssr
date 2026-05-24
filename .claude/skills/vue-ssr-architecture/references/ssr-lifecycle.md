# SSR lifecycle

## Build

```bash
npm run build:client    # dist/client/ (browser + SSR manifest)
npm run build:server    # dist/server/ (Node.js bundle)
```

## Request lifecycle

1. `server.js` receives request, calls `render(url)` from entry-server
2. `entry-server.js`: creates app → router.push(url) → renderToString → generates head (meta, hreflang, OG, Schema.org) → returns `{ html, head, locale, statusCode }`
3. `server.js`: injects HTML into template, sets `res.status(statusCode)`

## Meta/SEO

- `resolvePageMeta(route, i18n)` resolves i18n keys via `t()`
- Hreflang for all LOCALE_CODES + x-default → /en/...
- OG locale + alternates
- Schema.org JSON-LD for indexable pages
- `escapeHtml()` on all dynamic meta values

## SSR 404

NotFound route has `meta.statusCode: 404` propagated through entry-server → server.js.

## Dev reload model

- Vue/SSR code (entry-server, views, components, stores, router, SCSS) hot-reloads via
  Vite's module graph (`vite.ssrLoadModule` per request) + the browser HMR client.
- API code (`src/api/**`) also hot-reloads: `server.js` mounts it through
  `vite.ssrLoadModule('/src/api/router.js')` per `/api` request — no restart needed.
- The HMR websocket shares the app port (`hmr: { server: httpServer }` in server.js), so
  there is no separate Vite HMR port (24678 is gone from Docker too).
- Only `server.js` infra (middleware/session/mongo bootstrap) needs a real restart;
  `npm run dev` uses Node's built-in `--watch-path=./server.js` (no nodemon) for that.

## Gotchas

- `__APP_VERSION__`: Defined in vite.config.js from package.json
- Vuetify marked as `noExternal` for SSR in vite.config.js
- SCSS auto-inject: `styles/inject` loaded globally via vite.config.js preprocessorOptions
- `#src` alias in vite.config.js lets Vite resolve the `#src/*` subpath imports used by
  the API/server modules it loads via `ssrLoadModule`
