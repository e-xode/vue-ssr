# CLAUDE.md — Vue SSR Starter Kit

Project reference guide for AI-assisted development sessions. This file is the **single source of truth** for project conventions, architecture, and patterns.

## Project Overview

**Purpose**: Production-ready boilerplate/starter kit for Vue 3 + Express SSR applications with authentication, i18n, Vuetify 4, admin panel, contact page, and MongoDB.

**Version**: 2.0.0
**License**: MIT
**Node**: >=22.0.0

---

## Absolute Rules

1. **No comments in code** — Code must be self-explanatory. Only exception: empty catch blocks need `console.error`.
2. **SCSS externalized** — Every Vue component with styles has its own `.scss` file: `ComponentName.vue` -> `ComponentName.scss`. Referenced via `<style lang="scss" scoped src="./ComponentName.scss"></style>`.
3. **i18n mandatory** — All user-visible text must use `t('key')`. No hardcoded strings in templates.
4. **SCSS variables obligatoires** — No hardcoded colors, spacings, or font sizes. Use SCSS variables from `styles/variables.scss`.
5. **Factorisation shared/** — Any reusable logic goes in `src/shared/`. Never duplicate code.
6. **catch blocks** — Always include `console.error(err)` or `console.error(e)`. Never empty catch.
7. **ObjectId validation** — Always validate MongoDB ObjectId before queries. Use `parseObjectId()` from `dbHelpers.js`.
8. **Never auto-commit/push/release** — Only the developer commits. Commit format: `[$branch] content`.
9. **Composition API only** — No Options API. Use `<script setup>`.
10. **No over-engineering** — Keep it simple. YAGNI.

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3.5 (Composition API) + Pinia 3 + Vue Router 5 |
| SSR | Vite 7 + renderToString + Express middleware |
| UI | Vuetify 4 (Material Design 3) + MDI icons (@mdi/js) |
| i18n | Vue i18n v11 (EN/FR, Composition API legacy: false) |
| Backend | Express 5 + express-session + session-file-store |
| Database | MongoDB 7 (driver direct, no ODM) |
| Email | Nodemailer 8 |
| Auth | Email security code (6-digit SHA-256, 10 min expiry, bcryptjs) |
| Security | Helmet + CSP + express-rate-limit + CORS + timingSafeEqual |
| Build | Vite 7 (client + server bundles) |
| Tests | Vitest 3 + @vue/test-utils + happy-dom 20 |
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
server.js                       # Express entry (SSR, Helmet, CSP, sessions, static)
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
    api.js                      # apiFetch() client fetch wrapper (safeJson, FormData, rate-limit)
    const.js                    # All constants (BCRYPT_ROUNDS, LOCALES, USER_SAFE_PROJECTION, etc.)
    dbHelpers.js                # parseObjectId, parsePagination, findUserSafe, getUserWithCounts
    email.js                    # Code gen/hash/verify (SHA-256, timingSafeEqual), email sending
    log.js                      # logInfo, logWarn, logError, logDebug
    logger.js                   # logEvent(db, event, meta) - MongoDB events collection
    mongo.js                    # connectDB, getDB, closeDB
    security.js                 # getClientIp, isIpBlocked, recordLoginIp, destroyUserSessions
    utils.js                    # escapeHtml()

  composables/
    useLocalePath.js            # localePath(path), switchLocale(code), locale computed

  stores/
    auth.js                     # useAuthStore - user, signin, signup, verifyCode, signout
    index.js                    # Store exports

  plugins/vuetify.js            # Vuetify 4 config (light/dark themes, icons)
  styles/                       # variables.scss + mixins.scss (auto-injected)
  translate/                    # en.json, fr.json, emails/en.js, emails/fr.js

  components/layout/
    TheHeader.vue + .scss       # App bar: logo, nav, locale switcher, user menu
    TheFooter.vue + .scss       # Footer: copyright, links, contact
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

---

## API Endpoints

### Auth (signupLimiter: 5/15min, authLimiter: 10/15min, accountLimiter: 20/15min)
POST /api/auth/signup (5/15min), /signin, /verify-code, /resend-code, /forgot-password, /reset-password (no auth)
POST /api/auth/signout, GET /me, PUT /profile, POST /avatar, /change-password, /change-email (auth required)

### Contact (contactLimiter: 3/15min)
POST /api/contact (no auth)

### Admin (apiLimiter: 100/15min, requiresAdmin)
GET/PUT/DELETE /api/admin/users[/:id], POST /block
GET/DELETE /api/admin/logs[/:id], POST /bulk-delete

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

---

## Vuetify 4 Gotchas

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
COOKIE_SECRET=your-secret         # MUST be set in production
MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM
CONTACT_EMAIL=contact@example.com
CORS_ORIGIN=http://localhost:5173
```

---

## Tests

72 tests, 9 files. Run: `npm run test:run`

---

## Gotchas

1. MongoDB driver (no ODM): db.collection('users') directly. No Mongoose.
2. Session files: ./sessions/ directory. Persist across dev restarts.
3. ObjectId: req.session.userId is a string, convert with new ObjectId(str).
4. generateSecurityCode() is sync: crypto.randomInt(min, max) without callback is sync.
5. escapeHtml: Single source in shared/utils.js.
6. COOKIE_SECRET: Server refuses to start in production if missing/default.
7. SSR 404: NotFound route meta.statusCode: 404 propagated through entry-server -> server.js.
8. Rate limit detection: Client apiFetch sets error.isRateLimit = true on 429.
9. destroyUserSessions: Deletes session files except current (excludeSessionId).
10. __APP_VERSION__: Defined in vite.config.js from package.json.
11. Avatar dir: Auto-created with fs.mkdirSync recursive.
12. reCAPTCHA v3: invisible, score-based, disabled in dev. Server: `shared/captcha.js`. Client: `composables/useCaptcha.js`. Env: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_MIN_SCORE`.
13. Auth input validation: signin/signup emails are trimmed+lowercased server-side, validated with EMAIL_REGEX. Signup validates password≥8, name≥2.
14. Auth error messages are i18n keys (e.g. `error.auth.invalidEmail`), translated in views with `t(errorMessage)`.
15. Signup rate limit: 5 req/15min (separate `signupLimiter`, stricter than `authLimiter` at 10/15min).

---

## Project Ecosystem

```
e-xode.vue-ssr    → THIS PROJECT — Generic starter kit / boilerplate
e-xode.vitapulse  → Production SaaS (health app, Stripe, analytics) — source of patterns
e-xode.www        → Corporate site — derived from vue-ssr + existing content
```

- New generic features should land in **vue-ssr first**, then be adapted in downstream projects
- Cookie names are distinct per project: `app.sid` (vue-ssr), `vp.sid` (vitapulse), `www.sid` (www)
- All three share: locale routing, auth flow, SCSS system, Vuetify 4, security code verification

### SCSS Module Scoping (CRITICAL)
- `_inject.scss` (auto-injected by Vite) must only `@forward` variables + mixins — **NO CSS rules** or they duplicate in every component
- `_mixins.scss` needs its own `@use 'variables' as *;` (Sass `@use` creates isolated scope)
- View/component SCSS must **NOT** have `@use '@/styles'` — conflicts with auto-injection
- `<style>` tag **MUST** have `lang="scss"` for Vite additionalData to work

### Git Conventions
- Always include trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
