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

## Gotchas

- `__APP_VERSION__`: Defined in vite.config.js from package.json
- Vuetify marked as `noExternal` for SSR in vite.config.js
- SCSS auto-inject: `styles/inject` loaded globally via vite.config.js preprocessorOptions
