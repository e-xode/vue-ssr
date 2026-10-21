# SSR lifecycle

## Build

```bash
npm run build:client    # dist/client/ (browser + SSR manifest)
npm run build:server    # dist/server/ (Node.js bundle)
```

## Request lifecycle

1. `redirectMiddleware` (`src/api/http/redirects.js`) answers first: `/` gets a 302 to `/{locale}` picked from `Accept-Language`; non-canonical localized paths get a 301. Only `GET`/`HEAD`, never `/api`, assets or `/uploads`.
2. The SSR catch-all (`src/api/http/ssr.js`) parses the `theme` cookie and calls `render(url, db, theme)` from `entry-server.js`.
3. `entry-server.js`: `createApp({ theme, locale })` → `router.push(url)` → `setLocale(locale)` → optional `route.meta.prefetch({ route, pinia, ssrContext })` (receives `db` through `ssrContext`; errors are logged and the page renders without state) → `renderToString` → `generateHead()` (`src/ssr/head.js`) → returns `{ html, head, locale, statusCode, state }`; `state` is the Pinia state when a prefetch ran, otherwise `null`.
4. `ssr.js` fills the template markers (`<!--app-lang-->`, `<!--app-theme-->`, `<!--app-head-->`, `<!--app-state-->`, `<!--app-html-->`) and sends `res.status(statusCode)`. The state is emitted as `<script type="application/json" id="__SSR_STATE__">` (escaped with `serializeForScript`), never as inline JS.
5. `entry-client.js`: `createApp({ initialState: readSsrState() })` restores Pinia from that element; the first client navigation skips the route prefetch (`hydrated`), later navigations run `meta.prefetch` in `beforeResolve`.
6. In production the SSR bundle is loaded once and warmed up with a render of `/{DEFAULT_LOCALE}` before the server reports ready.

`createApp({ theme, locale, initialState })` returns `{ app, router, pinia, i18n, vuetify, setLocale }`; `main.js` also exports `interLatinFontUrl` (preloaded in the head). Vuetify is built by `createApplicationVuetify(ssr, theme, locale)`; `setLocale` updates both vue-i18n and Vuetify.

## Meta/SEO

- `src/ssr/head.js` (`generateHead`, `buildHeadContext`): page meta i18n keys are resolved via `t()`
- Hreflang for all LOCALE_CODES + x-default → /en/...
- OG locale + alternates
- Schema.org JSON-LD for indexable pages
- `<meta name="ga-id">` and `<meta name="recaptcha-site-key">` expose `GA_MEASUREMENT_ID` / `RECAPTCHA_SITE_KEY` (only when they match the expected pattern); client code reads them (`analytics.js`, `useCaptcha.js`) and loads gtag / reCAPTCHA itself, so no inline script is needed (CSP)
- `escapeHtml()` on all dynamic meta values

## SSR 404

NotFound route has `meta.statusCode: 404`; a component can also set `ssrContext.statusCode` via `useSsrStatus().setStatusCode(code)`. The status is propagated through entry-server → `ssr.js`.

## Dev reload model

- Vue/SSR code (entry-server, views, components, stores, router, SCSS) hot-reloads via
  Vite's module graph (`vite.ssrLoadModule` per request) + the browser HMR client.
- API code (`src/api/**` except `src/api/http/`) also hot-reloads: `src/api/http/dev.js` loads
  `/src/api/router.js` through `vite.ssrLoadModule` per `/api` request - no restart needed.
- The HMR websocket shares the app port (`hmr: { server: httpServer }`), so
  there is no separate Vite HMR port.
- `server.js` and `src/api/http/**` need a real restart (`npm run dev` only auto-restarts on
  `server.js` edits, via Node's built-in `--watch-path=./server.js`, no nodemon) and loads `.env`
  with `--env-file-if-exists`.
- File watching uses native events; set `VITE_USE_POLLING=true` when bind mounts do not deliver them.
- `docker/dev/node/run.sh` runs `npm install` only when `package-lock.json` changed (hash stamp in `node_modules/.lock-hash`).

## Gotchas

- `__APP_VERSION__`: Defined in vite.config.js from package.json
- Vuetify marked as `noExternal` for SSR in vite.config.js
- SCSS auto-inject: `styles/inject` loaded globally via vite.config.js preprocessorOptions
- `#src` alias in vite.config.js lets Vite resolve the `#src/*` subpath imports used by
  the API/server modules it loads via `ssrLoadModule`
