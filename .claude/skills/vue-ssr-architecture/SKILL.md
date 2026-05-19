---
name: vue-ssr-architecture
description: "Architecture reference for the Vue SSR Starter Kit (e-xode/vue-ssr): Vue 3.6 + Vite 7 + Express 5.1 + MongoDB + Vuetify 4 + Pinia + Vue Router with locale-prefixed routing. Covers file structure, SSR lifecycle (entry-server/entry-client/renderToString), locale routing system (useLocalePath, /:locale(en|fr)/), layout system (public/minimal/app), shared utilities inventory (apiFetch, parseObjectId, dbHelpers, email, security), API endpoint patterns (setupXRoute), view/component naming, Vuetify gotchas, and environment variables. Trigger on any architecture question, file placement, new feature scaffolding, routing, SSR, or shared utility usage. Don't use for: auth flow details (→ vue-ssr-auth), Docker/CI deployment (→ vue-ssr-deployment), post-task validation (→ vue-ssr-hooks)."
---

# Vue SSR Architecture

> Owns the full application architecture knowledge: stack, file structure, routing, SSR lifecycle, shared utilities, patterns, and conventions.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3.6 (Composition API) + Pinia 3.0 + Vue Router 5.0 |
| SSR | Vite 7 + renderToString + Express middleware |
| UI | Vuetify 4.0 (Material Design 3) + MDI icons (@mdi/js) |
| i18n | Vue i18n v11 (EN/FR, Composition API legacy: false) |
| Backend | Express 5.1 + express-session + session-file-store |
| Database | MongoDB 7 (native driver, connection pooling) |
| Email | Nodemailer 8 |
| Sanitization | DOMPurify 3.x |
| Security | Helmet 8 + CSP (production only) + express-rate-limit + CORS |
| Build | Vite 7 (client + server bundles) |
| Tests | Vitest 4 + @vue/test-utils + happy-dom 20 |
| Lint | ESLint 10 + eslint-plugin-vue 10 + Prettier |
| SCSS | sass-embedded (modern-compiler API) |

## File structure

See [references/file-structure.md](./references/file-structure.md) for the full annotated tree.

## Routing — locale-prefixed

All routes prefixed with `/:locale(en|fr)/`. See [references/routing-locale.md](./references/routing-locale.md).

## Layout system

| Layout | Usage | Header | Footer |
|--------|-------|--------|--------|
| public | Landing, contact | Yes | Yes |
| minimal | Auth pages | No | No |
| app | Dashboard, account, admin | Yes | Yes |

## SSR lifecycle

See [references/ssr-lifecycle.md](./references/ssr-lifecycle.md).

## Shared utilities inventory

| Module | Exports |
| --- | --- |
| `const.js` | BCRYPT_ROUNDS, SECURITY_CODE_EXPIRY_MS, LOCALES, USER_SAFE_PROJECTION, EMAIL_REGEX, isAdmin() |
| `dbHelpers.js` | parseObjectId(), parsePagination(), findUserSafe(), getUserWithCounts() |
| `email.js` | generateSecurityCode(), hashCode(), verifyCode(), sendSecurityCodeEmail(), sendContactEmail() |
| `security.js` | getClientIp(), isIpBlocked(), recordLoginIp(), destroyUserSessions() |
| `api.js` | apiFetch() — client fetch wrapper (AbortController 15s, rate-limit detection) |
| `mongo.js` | connectDB(), getDB(), closeDB() — connection pooling + ensureIndexes |
| `analytics.js` | Google Analytics gtag injection (SSR head, GA_MEASUREMENT_ID) |
| `captcha.js` | Server-side reCAPTCHA v3 verification |
| `utils.js` | escapeHtml() |
| `log.js` | logInfo(), logWarn(), logError(), logDebug() |
| `logger.js` | logEvent(db, event, meta) — MongoDB events collection |

## Key patterns

### Adding an API endpoint

```js
export function setupMyFeatureRoute(app, db) {
  app.post('/api/my-feature', async (req, res) => {
    try {
      res.json({ status: 'success', data })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  })
}
```

Register in `src/api/router.js`.

### Adding a view

1. Create `src/views/MyPage/MyPageView.vue` + `MyPageView.scss`
2. Add route to `localeRoutes` in `src/router.js`
3. Add i18n keys in `en.json` + `fr.json`
4. Use `useLocalePath()` for navigation links

### Naming conventions

- Components: PascalCase (TheHeader, AdminUsersView)
- Stores: useXStore (useAuthStore)
- API: setupXRoute(app, db)
- Views: XView.vue in views/X/
- SCSS: XView.scss alongside XView.vue
- Composables: useX.js

## Vuetify gotchas

1. Typography: MD3 classes (text-headline-small, text-title-medium)
2. Icon prop: Use `:icon="mdiXxx"` (bound), import from `@mdi/js`
3. CSS reset removed: Vuetify 4 no longer resets CSS
4. v-list-item to: Works like router-link, use `:to="localePath('/path')"`

## Environment variables

See [references/env-vars.md](./references/env-vars.md).

## Where to look

| If you need… | Read |
| --- | --- |
| Full file tree | [references/file-structure.md](./references/file-structure.md) |
| Route table and locale system | [references/routing-locale.md](./references/routing-locale.md) |
| SSR build and render cycle | [references/ssr-lifecycle.md](./references/ssr-lifecycle.md) |
| API endpoint patterns | [references/api-patterns.md](./references/api-patterns.md) |
| Environment variables list | [references/env-vars.md](./references/env-vars.md) |
