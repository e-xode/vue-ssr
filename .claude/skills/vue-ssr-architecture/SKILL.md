---
name: vue-ssr-architecture
description: "Architecture reference for the Vue SSR Starter Kit (e-xode/vue-ssr): Vue 3.5 + Vite 8 + Express 5 + MongoDB 7 + Vuetify 4 + Pinia + Vue Router with locale-prefixed routing. Covers file structure, the SSR lifecycle, the locale routing system (useLocalePath), the layout system, the shared-utilities inventory, view/component naming, Vuetify gotchas, and environment variables. Trigger on any architecture question, file placement, new feature scaffolding, routing, SSR, or shared utility usage. Don't use for: auth flow details (→ vue-ssr-auth), Express route mechanics/MongoDB access (→ vue-ssr-server), Docker/CI deployment (→ vue-ssr-deployment), post-task validation (→ vue-ssr-validation), UI/UX design (→ design agent)."
---

# Vue SSR Architecture

> Owns the full application architecture knowledge: stack, file structure, routing, SSR lifecycle, shared utilities, patterns, and conventions.

## Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| Frontend     | Vue 3.5+ (Composition API) + Pinia 3 + Vue Router 5          |
| SSR          | Vite 8 + renderToString + Express middleware                 |
| UI           | Vuetify 4 (Material Design 3) + MDI icons (@mdi/js)          |
| i18n         | Vue i18n v11 (EN/FR, Composition API legacy: false)          |
| Backend      | Express 5 + express-session + session-file-store             |
| Database     | MongoDB 7 (native driver, connection pooling)                |
| Email        | Nodemailer 10                                                |
| Sanitization | DOMPurify 3                                                  |
| Security     | Helmet 8 + CSP (script-src without inline, dev relaxes) + express-rate-limit (prod) + CORS |
| Build        | Vite 8 (client + server bundles)                             |
| Tests        | Vitest 4 + @vue/test-utils + happy-dom                       |
| Lint         | ESLint 10 + eslint-plugin-vue + Prettier                     |
| SCSS         | sass-embedded (modern-compiler API)                          |

## File structure

See [references/file-structure.md](./references/file-structure.md) for the full annotated tree.

## Routing — locale-prefixed

All routes prefixed with `/:locale(en|fr)/`. See [references/routing-locale.md](./references/routing-locale.md).

## Layout system

| Layout  | Usage                     | Header | Footer |
| ------- | ------------------------- | ------ | ------ |
| public  | Landing, contact          | Yes    | Yes    |
| minimal | Auth pages                | No     | No     |
| app     | Dashboard, account, admin | Yes    | Yes    |

## SSR lifecycle

See [references/ssr-lifecycle.md](./references/ssr-lifecycle.md).

## Shared utilities inventory

| Module         | Exports                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- |
| `const.js`     | BCRYPT_ROUNDS, SECURITY_CODE_*, RESEND_COOLDOWN_MS, SESSION_* (cookie name/options, SESSION_ABSOLUTE_MAX_AGE_MS, SESSION_DIR), AVATAR_*, LOG_LEVELS/DEFAULT_LOG_LEVEL, USER_SAFE_PROJECTION, USER_TYPES, EMAIL_REGEX, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_CODES, LOCALE_ROUTE_REGEX, isAdmin(), getIntlLocale(), getOgLocale() |
| `clientConstants.js` | Browser-facing constants: meta names (`ga-id`, `recaptcha-site-key`), script URLs, `SSR_STATE_ELEMENT_ID`, reveal/reduced-motion settings |
| `seoConstants.js` | Sitemap/robots TTLs and disallowed paths, site image/logo/favicon paths, theme colors, DEFAULT_APP_NAME |
| `dbHelpers.js` | parseObjectId(), parsePagination(), findUserSafe(), getUserWithCounts()                       |
| `email.js`     | generateSecurityCode(), hashCode(), verifyCode(), sendSecurityCodeEmail(), sendContactEmail() |
| `security.js`  | getClientIp() (`req.ip`), isIpBlocked(), assertNotBanned(), startUserSession(), isSessionExpired(), recordLoginIp(), destroyUserSessions() |
| `api.js`       | apiFetch() — client fetch wrapper (AbortController, configurable `timeout` default 15s, rate-limit detection) |
| `mongo.js`     | mongoConnect(), mongoClose() — MongoClient singleton with connection pooling; returns `{ client, db, error }` |
| `analytics.js` | Client-only GA4: `initAnalytics()` reads `<meta name="ga-id">`, loads gtag with consent defaults; trackPageView/trackEvent/... |
| `captcha.js`   | Server-side reCAPTCHA v3 verify (expectedAction check, RECAPTCHA_MIN_SCORE, `{success,score,reason}`); passes in dev, fails closed in production |
| `sanitize.js`  | sanitize(), isEmptyHtml() — curated sanitize-html allowlist for XSS-safe rich HTML            |
| `utils.js`     | escapeHtml(), readString(), readEmail(), escapeRegex()                                        |
| `serialize.js` | serializeForScript() — JSON safe to embed in `<script>` (escapes `<`, `>`, `&`, U+2028/2029)  |
| `title.js`     | buildTitle(pageTitle, appName) — `Page — App` titles, shared by SSR head and client          |
| `localizedRoutes.js` | PAGES (localized slugs), pageSlugs(), findPageBySlug(), localizedPath(), localizeSubPath(), pathLocaleMismatch() |
| `siteUrl.js`   | resolveSiteUrl(env), assertProductionSiteUrl(env) — `NODE_HOST` must be a public https origin in production |
| `sitemap.js`   | createSitemapCache(), buildSitemapXml() — built from `PAGES`                                  |
| `ssrState.js`  | readSsrState() — client reads the Pinia state serialized by the server                        |
| `log.js`       | logInfo(), logWarn(), logError(), logDebug() — filtered by `LOG_LEVEL`                        |
| `logger.js`    | logEvent(db, { event, userId, ip, meta }) — MongoDB logs collection                          |
| `theme.js`     | THEME_COOKIE, THEMES, DEFAULT_THEME, isValidTheme(), parseThemeCookie(), hasThemeChoice(), applyDocumentTheme() — SSR-safe light/dark theme |

## Division of responsibilities (vue-ssr-architecture ↔ vue-ssr-server)

| Concern                                                                   | Owner                 |
| -------------------------------------------------------------------------- | --------------------- |
| File structure, SSR lifecycle, locale routing, new view/feature scaffolding | `vue-ssr-architecture` |
| Express route mechanics, middleware guards, rate limiters, MongoDB queries/indexes | `vue-ssr-server` |

| Which endpoints need auth protection, and the auth-domain logic itself | vue-ssr-auth       |
| Build/bundle/production deployment config                              | vue-ssr-deployment |
| post-task validation                                                   | vue-ssr-validation |
## Key patterns

### Adding an API endpoint

Route-module mechanics (the `setupXRoute(app, db)` pattern, middleware guards, MongoDB access) are owned by `vue-ssr-server` — see that skill. This skill covers only the client-side half of a new feature: where the view/route/i18n keys go (below).

### Adding a view

1. Create `src/views/MyPage/MyPageView.vue` + `MyPageView.scss`
2. Add route to `localeRoutes` in `src/router.js` (a page with a localized slug and a sitemap entry goes in `PAGES` in `src/shared/localizedRoutes.js` and uses `pageRoute(name)`)
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

| If you need…                  | Read                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| Full file tree                | [references/file-structure.md](./references/file-structure.md) |
| Route table and locale system | [references/routing-locale.md](./references/routing-locale.md) |
| SSR build and render cycle    | [references/ssr-lifecycle.md](./references/ssr-lifecycle.md)   |
| Endpoint inventory & rate limits (mechanics → `vue-ssr-server`) | [references/api-patterns.md](./references/api-patterns.md) |
| Environment variables list    | [references/env-vars.md](./references/env-vars.md)             |
