# CLAUDE.md — Vue SSR Starter Kit

Project reference guide for AI-assisted development sessions. This file is the **single source of truth** for project conventions, architecture, and patterns.

## Project Overview

**Purpose**: Production-ready boilerplate/starter kit for Vue 3 + Express SSR applications with authentication, i18n, Vuetify 4, admin panel, contact page, and MongoDB.

**Version**: 2.0.0
**License**: MIT
**Node**: >=24.0.0

---

## Absolute Rules

1. **No comments in code** — Code must be self-explanatory. Only exception: empty catch blocks need `console.error`.
2. **SCSS externalized** — Every Vue component with styles has its own `.scss` file: `ComponentName.vue` -> `ComponentName.scss`. Referenced via `<style lang="scss" scoped src="./ComponentName.scss"></style>`.
3. **i18n mandatory** — All user-visible text must use `t('key')`. No hardcoded strings in templates.
4. **SCSS variables obligatoires** — No hardcoded colors, spacings, or font sizes. Use SCSS variables from `styles/variables.scss`.
5. **Factorisation shared/** — Any reusable logic goes in `src/shared/`. Never duplicate code.
6. **catch blocks** — Always include `console.error(err)` or `console.error(e)`. Never empty catch.
7. **ObjectId validation** — Always validate MongoDB ObjectId before queries. Use `parseObjectId()` from `dbHelpers.js`.
8. **Never auto-commit/push/release** — Only the developer commits. Commit format: `[$branch] content`. **Exception: "release"** — When the developer says "release", execute the full release process: update CHANGELOG.md, bump version in package.json, commit, push, create git tag and push it.
9. **Composition API only** — No Options API. Use `<script setup>`.
10. **No over-engineering** — Keep it simple. YAGNI.

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3.6 (Composition API) + Pinia 3.1 + Vue Router 4.6 |
| SSR | Vite 7 + renderToString + Express middleware |
| UI | Vuetify 3.9 (Material Design 3) + MDI icons (@mdi/js) |
| i18n | Vue i18n v12 (EN/FR, Composition API legacy: false) |
| Backend | Express 5.1 + express-session + session-file-store |
| Database | MongoDB via Mongoose 8.15 (connection pooling + ensureIndexes) |
| Email | Nodemailer 8 |
| Auth | Email security code (6-digit SHA-256, 10 min expiry, bcryptjs) |
| Sanitization | DOMPurify 3.x |
| Security | Helmet 9 + CSP (production only) + express-rate-limit + CORS + timingSafeEqual |
| Build | Vite 7 (client + server bundles) |
| Tests | Vitest 4 + @vue/test-utils + happy-dom 20 |
| Lint | ESLint 10 + eslint-plugin-vue 10 + Prettier |
| SCSS | sass-embedded (modern-compiler API) |

---

## Commands

```bash
npm run dev          # Dev server (SSR + HMR)
npm run build        # Build client + server bundles
npm run prod         # Production mode (requires build first)
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run (CI)
npm run test:coverage # Vitest with coverage
npm run lint         # ESLint fix
npm run lint:check   # ESLint check only
```

---

## File Structure

```
server.js                       # Express entry (SSR, Helmet, CSP, sessions, static, graceful shutdown, sitemap)
vite.config.js                  # __APP_VERSION__, @root alias, SCSS auto-inject
package.json                    # v2.0.0
eslint.config.js                # Flat config ESLint 10
vitest.config.js                # Vitest config
docker-compose.yml              # Dev: MongoDB + app
Dockerfile                      # Multi-stage production build

src/
  main.js                       # createApp() - Vue + Vuetify + Pinia + i18n + Router
  entry-client.js               # Client hydration + locale sync (afterEach, isReady)
  entry-server.js               # SSR render + SEO meta + hreflang + Schema.org
  router.js                     # Routes with /:locale(en|fr)/ prefix + guards
  App.vue + App.scss            # Root component with layout system
  style.css                     # Global CSS reset

  api/
    router.js                   # API route registration + rate limiters
    middleware.js               # requireAuth, requireAdmin middleware
    auth/                       # 12 auth endpoints (signup, signin, verify, etc.)
    contact/send.js             # POST /api/contact (rate limited 3/15min)
    admin/                      # users.js + logs.js

  shared/
    analytics.js                # Google Analytics gtag injection (GA_MEASUREMENT_ID)
    api.js                      # apiFetch() client fetch wrapper (AbortController 15s timeout, content-type detection, safeJson, FormData, rate-limit)
    captcha.js                  # Server-side reCAPTCHA v3 verification (RECAPTCHA_SECRET_KEY)
    const.js                    # All constants (BCRYPT_ROUNDS, LOCALES, USER_SAFE_PROJECTION, etc.)
    dbHelpers.js                # parseObjectId, parsePagination, findUserSafe, getUserWithCounts
    email.js                    # Code gen/hash/verify (SHA-256, timingSafeEqual), email sending
    log.js                      # logInfo, logWarn, logError, logDebug
    logger.js                   # logEvent(db, event, meta) - MongoDB events collection
    mongo.js                    # connectDB, getDB, closeDB (Mongoose pooling + ensureIndexes)
    security.js                 # getClientIp, isIpBlocked, recordLoginIp, destroyUserSessions
    utils.js                    # escapeHtml()

  composables/
    useCaptcha.js               # Client-side reCAPTCHA v3 (RECAPTCHA_SITE_KEY, execute, token)
    useLocalePath.js            # localePath(path), switchLocale(code), locale computed (locale validation, i18n sync, localStorage persistence)

  stores/
    auth.js                     # useAuthStore - user, signin, signup, verifyCode, signout
    index.js                    # Store exports

  plugins/vuetify.js            # Vuetify 3.9 config (light/dark themes, icons)
  styles/                       # variables.scss + mixins.scss (auto-injected)
    _animations.scss            # 12 keyframe animations library
    _utilities.scss             # Gradient, glass, badge, skeleton utility classes
    _inject.scss                # SCSS auto-inject entry (variables + mixins)
  translate/                    # en.json, fr.json, emails/en.js, emails/fr.js

  components/layout/
    TheHeader.vue + .scss       # App bar: logo, nav, locale switcher, user menu, mobile nav drawer
    TheFooter.vue + .scss       # Multi-column footer: copyright, links, contact, version display
    index.js                    # Layout exports

  views/
    Index/IndexView.vue + .scss       # Landing page (public)
    Contact/ContactView.vue + .scss   # Contact form (public)
    Auth/ (5 views + .scss each)      # Signin, Signup, VerifyCode, ForgotPassword, ResetPassword
    Dashboard/DashboardView.vue       # User dashboard (app)
    Account/AccountView.vue           # Profile/email/password tabs (app)
    Admin/ (3 views)                  # AdminUsers, AdminUserDetail, AdminLogs
    NotFound/NotFoundView.vue         # 404 page

tests/unit/                     # 9 test files, 72 tests
public/                         # Static assets + uploads/avatars/
```

---

## Routing - Locale-Prefixed

All routes are prefixed with `/:locale(en|fr)/`. The locale is extracted from the URL.

```
/                       -> redirects to /{savedLocale} or /{browserLang} or /en
/en/                    -> IndexView (public)
/en/signup              -> SignupView (minimal, guest)
/en/signin              -> SigninView (minimal, guest)
/en/auth/verify-code    -> VerifyCodeView (minimal)
/en/forgot-password     -> ForgotPasswordView (minimal, guest)
/en/reset-password      -> ResetPasswordView (minimal, guest)
/en/dashboard           -> DashboardView (app, requiresAuth)
/en/account             -> AccountView (app, requiresAuth)
/en/contact             -> ContactView (public)
/en/admin               -> redirects to /en/admin/users
/en/admin/users         -> AdminUsersView (app, requiresAuth, requiresAdmin)
/en/admin/users/:userId -> AdminUserDetailView (app, requiresAuth, requiresAdmin)
/en/admin/logs          -> AdminLogsView (app, requiresAuth, requiresAdmin)
/:pathMatch(.*)*        -> NotFoundView (404 status)
```

### How Locale Routing Works

1. **Router** (router.js): Routes defined as `localeRoutes[]` (no leading /), wrapped in parent `/:locale()`.
2. **Root redirect**: / -> /{savedLocale} -> /{browserLang} -> /en.
3. **Composable** (useLocalePath.js): `localePath(path)` returns `/{locale}{path}`, `switchLocale(code)` replaces locale in URL.
4. **entry-client.js**: afterEach syncs route.params.locale -> i18n + localStorage.
5. **entry-server.js**: Extracts locale from route params, generates hreflang tags.
6. **All links** use `:to="localePath('/path')"` - never hardcoded paths.

### Adding a New Route

```js
// In router.js localeRoutes array:
{
    path: 'my-page',
    name: 'MyPage',
    component: () => import('@/views/MyPage/MyPageView.vue'),
    meta: {
        layout: 'public',       // 'public' | 'minimal' | 'app'
        title: 'meta.myPage.title',
        description: 'meta.myPage.description',
    }
}
```

---

## Layout System

| Layout | Usage | Header | Footer |
|--------|-------|--------|--------|
| public | Landing, contact | Yes | Yes |
| minimal | Auth pages | No | No |
| app | Dashboard, account, admin | Yes | Yes |

---

## Auth Flow

### Signup -> Verify -> Dashboard
1. POST /api/auth/signup -> creates user, generates 6-digit code (crypto.randomInt), hashes SHA-256
2. Email sent with code -> user enters in VerifyCodeView
3. POST /api/auth/verify-code -> verifyCode() uses timingSafeEqual, creates session
4. Redirect to /:locale/dashboard

### Constants
- SECURITY_CODE_EXPIRY_MS = 600000 (10 minutes)
- SECURITY_CODE_MAX_ATTEMPTS = 3
- RESEND_COOLDOWN_MS = 30000
- BCRYPT_ROUNDS = 10

### Security Features
- Code generation: crypto.randomInt (not Math.random)
- Code hashing: SHA-256 hex (not base64)
- Code verification: timingSafeEqual (not string compare)
- Session destruction after password/email change
- Rate limiting per endpoint type
- Helmet CSP configured
- COOKIE_SECRET validated in production

---

## SSR Architecture

### Build
```bash
npm run build:client    # dist/client/ (browser + SSR manifest)
npm run build:server    # dist/server/ (Node.js bundle)
```

### Lifecycle
1. server.js receives request, calls render(url) from entry-server
2. entry-server.js: creates app -> router.push(url) -> renderToString -> generates head (meta, hreflang, OG, Schema.org) -> returns { html, head, locale, statusCode }
3. server.js: injects HTML, sets res.status(statusCode)

### Meta/SEO
- resolvePageMeta(route, i18n) resolves i18n keys via t()
- Hreflang for all LOCALE_CODES + x-default -> /en/...
- OG locale + alternates
- Schema.org JSON-LD for indexable pages
- escapeHtml() on all dynamic meta values

---

## i18n

### Files
- src/translate/en.json, fr.json - UI translations
- src/translate/emails/en.js, fr.js - Email templates

### Adding a Language
1. Create xx.json (translate from en.json)
2. Create emails/xx.js
3. Add to SUPPORTED_LOCALES in const.js
4. Import in main.js, add to messages

---

## Shared Utilities

### const.js
BCRYPT_ROUNDS, SECURITY_CODE_EXPIRY_MS, SECURITY_CODE_MAX_ATTEMPTS, RESEND_COOLDOWN_MS, DEFAULT_LOCALE, EMAIL_REGEX, USER_TYPES, USER_SAFE_PROJECTION, SUPPORTED_LOCALES, LOCALE_CODES, LOCALE_ROUTE_REGEX, getIntlLocale(), getOgLocale(), isAdmin()

### dbHelpers.js
parseObjectId(str), parsePagination(query, opts), findUserSafe(db, filter), getUserWithCounts(db, userId)

### email.js
generateSecurityCode() -> { code, hash } SYNC, hashCode(code) -> SHA-256 hex, verifyCode(input, hash) -> timingSafeEqual boolean, sendSecurityCodeEmail(), sendContactEmail()

### security.js
getClientIp(req), isIpBlocked(db, ip), recordLoginIp(db, userId, ip), destroyUserSessions(userId, excludeSessionId)

### analytics.js
Injects Google Analytics gtag script into SSR head when GA_MEASUREMENT_ID is set. Server-side only.

### captcha.js
Server-side reCAPTCHA v3 token verification. Sends token to Google API with RECAPTCHA_SECRET_KEY. Returns score-based pass/fail.

---

## API Endpoints

### Auth (authLimiter: 10/15min, accountLimiter: 20/15min)
POST /api/auth/signup, /signin, /verify-code, /resend-code, /forgot-password, /reset-password (no auth)
POST /api/auth/signout, GET /me, PUT /profile, POST /avatar, /change-password, /change-email (auth required)

### Contact (contactLimiter: 3/15min)
POST /api/contact (no auth)

### Admin (apiLimiter: 100/15min, requiresAdmin)
GET/PUT/DELETE /api/admin/users[/:id], POST /block
GET/DELETE /api/admin/logs[/:id], POST /bulk-delete

### Sitemap
GET /sitemap.xml — Dynamic generation from routes, cached 1h TTL

---

## Key Patterns

### Adding an API Endpoint
```js
// src/api/myFeature/action.js
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
// Register in api/router.js
```

### Adding a View
1. Create views/MyPage/MyPageView.vue + .scss
2. Add route to localeRoutes in router.js
3. Add i18n keys in en.json + fr.json
4. Use useLocalePath() for navigation

### Naming Conventions
- Components: PascalCase (TheHeader, AdminUsersView)
- Stores: useXStore (useAuthStore)
- API: setupXRoute(app, db)
- Views: XView.vue in views/X/
- SCSS: XView.scss alongside XView.vue
- Composables: useX.js

### apiFetch Pattern
Client-side fetch wrapper in `shared/api.js`:
- AbortController with 15s timeout (auto-aborts slow requests)
- Content-type detection: auto-parses JSON, returns text for non-JSON
- FormData support (no Content-Type header for multipart)
- Rate-limit detection: sets `error.isRateLimit = true` on 429
- safeJson() wrapper for resilient JSON parsing

### Captcha Integration
- **Server** (`shared/captcha.js`): Verifies reCAPTCHA v3 token via Google API using RECAPTCHA_SECRET_KEY. Called in auth endpoints (signup, signin, contact).
- **Client** (`composables/useCaptcha.js`): Loads reCAPTCHA script, exposes `execute(action)` to get token. Used in auth forms.
- Gracefully skipped if RECAPTCHA_SITE_KEY is not configured.

### Analytics Tracking
- `shared/analytics.js` injects Google Analytics gtag into SSR head markup
- Activated when GA_MEASUREMENT_ID env var is set
- Script injected server-side for first-paint tracking

### Rate Limiting Strategy
Graduated rate limiting per endpoint type (disabled in dev):
| Limiter | Limit | Window | Endpoints |
|---------|-------|--------|-----------|
| authLimiter | 10 req | 15 min | signup, signin, verify, reset |
| accountLimiter | 20 req | 15 min | profile, password, email changes |
| contactLimiter | 3 req | 15 min | POST /api/contact |
| apiLimiter | 100 req | 15 min | admin endpoints |

### Graceful Shutdown
Server listens to SIGTERM and SIGINT signals. On shutdown:
1. Stops accepting new connections
2. Closes MongoDB connection (closeDB)
3. Exits process cleanly
Ensures zero data loss during Docker stop / deployment rolling updates.

### Dynamic Sitemap
GET /sitemap.xml generates sitemap from route definitions:
- Cached in memory with 1h TTL (avoids regeneration on every request)
- Includes all public locale-prefixed routes
- Excludes auth/admin routes

### MongoDB Connection Pooling
`shared/mongo.js` configures Mongoose with connection pooling:
- `ensureIndexes()` called on startup to create/verify collection indexes
- Pooled connections reused across requests (no per-request connect/disconnect)

---

## Vuetify 3.9 Gotchas

1. Typography: MD3 classes (text-headline-small, text-title-medium, etc.)
2. Icon prop: Use :icon="mdiXxx" (bound), import from @mdi/js
3. CSS reset removed: Vuetify 4 no longer resets CSS
4. v-list-item to: Works like router-link, use :to="localePath('/path')"

---

## Environment Variables

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=vue-ssr
NODE_HOST=http://localhost:5173
APP_NAME=vue-ssr
COOKIE_SECRET=your-secret              # MUST be set in production
MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM
CONTACT_EMAIL=contact@example.com
CORS_ORIGIN=http://localhost:5173
GA_MEASUREMENT_ID=G-XXXXXXXXXX         # Google Analytics 4 measurement ID
RECAPTCHA_SITE_KEY=6Le...              # reCAPTCHA v3 site key (client)
RECAPTCHA_SECRET_KEY=6Le...            # reCAPTCHA v3 secret key (server)
FACEBOOK_APP_ID=123456789              # Facebook Open Graph app_id
```

---

## Tests

72 tests, 9 files. Run: `npm run test:run`

---

## Gotchas

1. MongoDB via Mongoose: Models and connection managed through `shared/mongo.js`. Connection pooling enabled by default.
2. Session files: ./sessions/ directory. Persist across dev restarts.
3. ObjectId: req.session.userId is a string, convert with new ObjectId(str).
4. generateSecurityCode() is sync: crypto.randomInt(min, max) without callback is sync.
5. escapeHtml: Single source in shared/utils.js.
6. COOKIE_SECRET: Server refuses to start in production if missing/default.
7. SSR 404: NotFound route meta.statusCode: 404 propagated through entry-server -> server.js.
8. Rate limit detection: Client apiFetch sets error.isRateLimit = true on 429.
9. destroyUserSessions: Deletes session files except current (excludeSessionId).
10. __APP_VERSION__: Defined in vite.config.js from package.json. ESLint configured with `__APP_VERSION__` global.
11. Avatar dir: Auto-created with fs.mkdirSync recursive.
12. CSP: Helmet CSP is production-conditional (disabled in dev for HMR/devtools compatibility).
13. Captcha: Gracefully degraded when RECAPTCHA_SITE_KEY is not set (forms work without captcha).
14. Error stack traces: Hidden in production responses (shown only in dev).
15. Sitemap cache: 1h TTL, auto-regenerated after expiry.
16. apiFetch timeout: 15s AbortController — requests auto-abort if server doesn't respond.
