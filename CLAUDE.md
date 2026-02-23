# CLAUDE.md — Vue SSR Starter Kit

Project reference guide for AI-assisted development sessions.

## Project Overview

**Purpose**: Boilerplate/starter kit for Vue 3 + Express SSR applications with authentication, i18n, Vuetify, admin panel, and MongoDB.

**Version**: 1.2.2
**License**: MIT
**Node**: >=22.0.0

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3 (Composition API) + Pinia + Vue Router 4 |
| SSR | Vite 7 + `renderToString` + Express middleware |
| UI | Vuetify 3 (Material Design 3) + MDI icons (`@mdi/js`) |
| i18n | Vue i18n v11 (EN/FR, Composition API `legacy: false`) |
| Backend | Express 5 + express-session + session-file-store |
| Database | MongoDB 6 (driver direct, no ODM) |
| Email | Nodemailer 8 |
| Auth | Email security code (6-digit, 10 min expiry, bcryptjs) |
| Security | Helmet + express-rate-limit + CORS whitelist |
| Build | Vite 7 (client + server bundles) |
| Tests | Vitest 3 + @vue/test-utils + happy-dom 20 |
| Lint | ESLint 10 + eslint-plugin-vue 10 + Prettier |
| Styles | SCSS (variables + mixins injected globally via Vite) |

---

## Directory Structure

```text
/
├── server.js                    # Express entry point (SSR + API + session)
├── index.html                   # HTML template with <!--app-head--> <!--app-html--> <!--app-lang-->
├── vite.config.js               # Vite config (SCSS inject, SSR noExternal vuetify)
├── eslint.config.js             # ESLint flat config (ESLint 10 + eslint-plugin-vue 10)
├── vitest.config.js             # Vitest config (happy-dom, @/ and #src/ aliases)
├── .env                         # Environment variables (see section below)
├── src/
│   ├── entry-client.js          # Client hydration
│   ├── entry-server.js          # SSR render + SEO meta tags generation
│   ├── main.js                  # createApp() factory (Vue + Pinia + i18n + Vuetify + Router)
│   ├── App.vue                  # Root component — layout switching (public/minimal/app)
│   ├── router.js                # Vue Router + navigation guards (requiresAuth, guest, requiresAdmin)
│   ├── api/
│   │   ├── router.js            # registerApiRoutes() — rate limiting + route registration
│   │   ├── middleware.js        # requireAuth, requireAdmin(db)
│   │   ├── auth/                # signup, signin, signout, me, verifyCode, resendCode
│   │   └── admin/
│   │       └── users.js         # GET/PUT/DELETE /api/admin/users[/:id]
│   ├── components/
│   │   └── layout/
│   │       ├── TheHeader.vue    # App bar — nav, language switcher, user menu, admin link
│   │       ├── TheFooter.vue    # Public footer
│   │       └── index.js
│   ├── plugins/
│   │   └── vuetify.js           # Vuetify instance (themes light/dark, defaults, MDI icons)
│   ├── shared/
│   │   ├── api.js               # apiFetch() frontend helper
│   │   ├── const.js             # SECURITY_CODE_EXPIRY_MS, USER_TYPES, etc.
│   │   ├── email.js             # sendSecurityCodeEmail, sendWelcomeEmail, sendContactEmail
│   │   ├── log.js               # logInfo, logWarn
│   │   └── mongo.js             # mongoConnect() — returns { db, error }
│   ├── stores/
│   │   └── auth.js              # useAuthStore — user, isAuthenticated, isAdmin, signup, signin...
│   ├── styles/
│   │   ├── variables.scss       # Spacing, shadows, breakpoints, transitions
│   │   └── mixins.scss          # flex-center, respond-to, hover-lift, visually-hidden...
│   ├── translate/
│   │   ├── en.json              # English translations
│   │   ├── fr.json              # French translations
│   │   └── emails/
│   │       ├── en.js            # EN email templates: securityCode, welcome, contact
│   │       └── fr.js            # FR email templates: securityCode, welcome, contact
│   └── views/
│       ├── Index/IndexView.vue
│       ├── Auth/
│       │   ├── SignupView.vue
│       │   ├── SigninView.vue
│       │   └── VerifyCodeView.vue
│       ├── Dashboard/DashboardView.vue
│       ├── Admin/
│       │   ├── AdminUsersView.vue       # User list with search + delete
│       │   └── AdminUserDetailView.vue  # User edit (name, type)
│       └── NotFound/NotFoundView.vue
├── tests/
│   ├── setup.js
│   └── unit/                    # Vitest test suites (70 tests, 9 files)
├── docker/
│   ├── dev/node/                # Node 22 dev Dockerfile + run.sh
│   └── dev/mongo/               # MongoDB Dockerfile + init script
└── logs/sessions/               # Session files (gitignored)
```

---

## Environment Variables

Copy `.env` and configure:

```bash
NODE_ENV=development
NODE_PORT=5173
NODE_HOST=http://localhost:5173
APP_NAME=App                     # Used in email templates and SEO

MONGO_DB=app
MONGO_HOST=e-xode-mongo-vue-ssr  # Docker service name OR Atlas URI host
MONGO_USER=user
MONGO_PWD=password
MONGO_TYPE=mongodb               # mongodb or mongodb+srv

COOKIE_SECRET=change-me-in-production

MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_SSL=false
MAILER_LOGIN=user@example.com
MAILER_PASSWORD=password
MAILER_FROM=noreply@example.com
MAILER_TO=admin@example.com      # Contact form recipient

# Optional
BASE=/                           # URL base path
```

---

## Authentication Flow

1. **Signup / Signin** → POST to `/api/auth/signup` or `/api/auth/signin`
2. Server generates 6-digit code, hashes it (base64), stores in `users` collection with 10-min expiry
3. Email sent via Nodemailer with the code
4. **Verify Code** → POST `/api/auth/verify-code` with `{ email, code }`
5. Server validates code, creates `req.session.userId`, clears code from DB
6. **Session cookie** `app.sid` — HTTP-only, SameSite: lax, 7-day maxAge, secure in production
7. **`GET /api/auth/me`** — returns user from session (without password field)

### Security Code limits

| Setting | Value | Constant |
| --- | --- | --- |
| Expiry | 10 minutes | `SECURITY_CODE_EXPIRY_MS` |
| Max attempts | 5 | `SECURITY_CODE_MAX_ATTEMPTS` |
| Rate limit (auth) | 10 req / 15 min | `authLimiter` in `api/router.js` |

---

## User Model (MongoDB `users` collection)

```js
{
  _id: ObjectId,
  email: String,           // unique
  password: String,        // bcryptjs hash (10 rounds)
  name: String,
  type: 'user' | 'admin',  // default: 'user'
  securityCode: String,    // base64 hash — cleared after verify
  securityCodeExpires: Date,
  securityCodeAttempts: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Roles & Admin

- User `type` field: `'user'` (default) or `'admin'`
- **`requireAdmin(db)` middleware** — async, checks DB on each request
- Admin routes: `/admin/users`, `/admin/users/:userId`
- API routes: `GET/PUT/DELETE /api/admin/users[/:id]`
- Frontend guard: `requiresAdmin: true` in route meta → redirects non-admins to `/dashboard`
- Admin nav link visible in header only when `authStore.isAdmin === true`

---

## Layout System

Configured via `route.meta.layout`:

| Value | Header | Footer | Use case |
| --- | --- | --- | --- |
| `'public'` | ✅ | ✅ | Landing, public pages |
| `'minimal'` | ❌ | ❌ | Auth pages, 404 |
| `'app'` | ✅ | ❌ | Dashboard, admin, protected pages |

---

## SSR Architecture

### Request lifecycle

1. Browser → `GET /any-path`
2. Express catches `*all` route
3. Dev: `vite.ssrLoadModule('/src/entry-server.js')` / Prod: `import('./dist/server/entry-server.js')`
4. `render(url)` → `createApp()` + `router.push(url)` + `renderToString(app)`
5. `generateHead(route, locale)` → meta tags (charset, OG, Twitter, hreflang, Schema.org)
6. Template replacements: `<!--app-lang-->`, `<!--app-head-->`, `<!--app-html-->`
7. Response sent as `text/html`
8. Browser: `entry-client.js` hydrates the DOM

### Build commands

```bash
npm run build:client   # vite build --outDir dist/client --ssrManifest
npm run build:server   # vite build --ssr src/entry-server.js --outDir dist/server
npm run build          # both
```

### Dev vs Prod

- **Dev**: Vite middleware mode, HMR, no static serving
- **Prod**: `compression()` + `sirv('./dist/client')` + precompiled SSR bundle

---

## i18n

- Files: `src/translate/en.json`, `src/translate/fr.json`
- Email templates: `src/translate/emails/en.js`, `src/translate/emails/fr.js`
- Locale stored in `localStorage('locale')`
- SSR: locale set from `route.params.locale` in `entry-server.js`
- `legacy: false` → use `useI18n()` Composition API in all components
- `fallbackLocale: 'en'`

Adding a new language: add JSON file + import in `main.js` + add to `templates` object in `email.js`.

---

## SEO (entry-server.js)

Generated server-side per route:

- Standard: charset, viewport, description, robots, theme-color, canonical
- hreflang: current locale + alternate locale + x-default
- OpenGraph: og:title, og:description, og:url, og:type, og:image, og:site_name
- Twitter Card: summary_large_image
- Apple: mobile-web-app-capable, touch-icon
- Schema.org JSON-LD: `WebSite` with `SearchAction` (public pages only)
- `robots: 'noindex, nofollow'` for protected routes (auto, via route meta)

`APP_NAME` env var controls the app name in meta tags.

---

## Email Templates

Templates are functions in `src/translate/emails/[locale].js`:

| Key | Subject | Function signature |
| --- | --- | --- |
| `securityCode` | String | `html(code: string)` |
| `welcome` | Function(name) | `html(name: string)` |
| `contact` | Function(data) | `html(data: {name, email, message})` |

Email functions in `src/shared/email.js`:

- `sendSecurityCodeEmail(email, code, locale)`
- `sendWelcomeEmail(email, name, locale)`
- `sendContactEmail(data, locale)` — sends to `MAILER_TO`

---

## Vuetify Configuration

File: `src/plugins/vuetify.js`

- Theme: `light` (default) + `dark`
- Primary: `#2563eb` (blue), Secondary: `#7c3aed` (violet)
- Icons: MDI via `@mdi/js` (tree-shakeable, import individual icons)
- Defaults: `VBtn variant: flat`, `VCard rounded: xl elevation: 0`, `VTextField variant: outlined`
- SSR: `createApplicationVuetify(ssr)` — passes SSR flag for server-side rendering

### Vuetify pitfalls

- **Do not use `icon` (boolean) + `:icon="..."` on the same `v-btn`** — ESLint flags it as `vue/no-duplicate-attributes`. Use only `:icon="mdiXxx"` and remove the standalone `icon` attribute.
- `v-slot:activator` → prefer `#activator` shorthand (eslint-plugin-vue `vue/v-slot-style`)

---

## SCSS System

Injected globally via Vite `additionalData`:

```scss
@use "src/styles/variables" as *;
@use "src/styles/mixins" as *;
```

**Variables** (`_variables.scss`): `$spacing-*`, `$border-radius-*`, `$shadow-*`, `$transition-*`, `$breakpoint-*`

**Mixins** (`_mixins.scss`): `flex-center`, `flex-between`, `flex-col`, `truncate`, `multiline-truncate($lines)`, `absolute-center`, `transition`, `hover-lift`, `button-reset`, `visually-hidden`, `respond-to($breakpoint)`

---

## ESLint Configuration

File: `eslint.config.js` — **flat config format** (ESLint 10 requires this).

```js
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: [...] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],   // eslint-plugin-vue 10.x key
  {
    files: ['**/*.{js,mjs,cjs,jsx,vue}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node } },
    rules: { ... }
  }
]
```

**Important**: in eslint-plugin-vue 10.x, the flat config key is `flat/recommended` (Vue 3), **not** `flat/vue3-recommended`.

Required devDependencies for ESLint 10 flat config:

- `eslint` ^10.0.1
- `eslint-plugin-vue` ^10.8.0
- `@eslint/js` ^10.0.1
- `globals` ^17.x

---

## Dependency Management

### npm overrides

Used to force safe versions of transitive dependencies that can't be updated through the normal dependency tree:

```json
"overrides": {
  "bn.js": "^5.2.3",
  "minimatch": "^10.2.2"
}
```

- **bn.js**: forced to 5.x to fix CVE via `session-file-store → kruptein → asn1.js`
- **minimatch**: forced to 10.2.2+ (supports Node 22, fixes ReDoS) via `@vue/test-utils → js-beautify → editorconfig`

After changing overrides, always run `npm install` to regenerate `package-lock.json`.

### Checking vulnerabilities

```bash
npm audit                  # Full report
npm audit fix              # Fix non-breaking issues
npm audit fix --force      # Fix with breaking changes (review carefully)
```

---

## Docker

### Development

```bash
# Start all services
docker compose up

# Services:
# - e-xode-vue-ssr (Node 22, port NODE_PORT)
# - e-xode-mongo-vue-ssr (MongoDB 27017)
```

MongoDB waits for healthy state before Node starts (`depends_on: condition: service_healthy`).

Source code is volume-mounted (`- '.:/app'`), so HMR works.

### Production build

File: `docker/build/Dockerfile` — multi-stage build:

| Stage | Image | Role |
| --- | --- | --- |
| `builder` | `node:22-alpine3.19` | Install deps + `npm run build` (client + server bundles) |
| `runner` | `node:22-slim` | Copy `dist/` + `server.js` + `src/` + run with supervisord |

Build args: `NODE_HOST` (default `https://www.mywebsite.com`), `NODE_PORT` (default `3002` builder / `3006` runner).

The runner only installs production deps (`npm install --production=true`) and is managed by supervisord (`docker/build/config/supervisord.conf`).

---

## Testing

```bash
npm test              # Watch mode
npm run test:run      # CI mode (single run)
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

Config: `vitest.config.js` — environment: `happy-dom`, setup: `tests/setup.js`

Tests mock `console.*`, `process.env`, MongoDB, and Nodemailer.

**Current state**: 9 test files, 70 tests, all passing.

---

## Key Patterns

### Adding a new API route

1. Create `src/api/[feature]/[action].js` with `export function setup[Action]Route(app, db) { ... }`
2. Import and call in `src/api/router.js` inside `registerApiRoutes()`
3. Use `requireAuth` for protected routes, `requireAdmin(db)` for admin routes

### Adding a new page

1. Create `src/views/[Feature]/[Feature]View.vue`
2. Add route to `src/router.js` with appropriate `meta.layout`, `meta.requiresAuth`, `meta.robots`
3. Add i18n keys to `en.json` and `fr.json` under `meta.[routeName]`

### Adding a new Pinia store

1. Create `src/stores/[feature].js` with `defineStore('[feature]', () => { ... })`
2. Export from `src/stores/index.js`
3. Import via `useFeatureStore()` in components

### Adding an email template

1. Add key to `src/translate/emails/en.js` and `fr.js`
2. Add export function to `src/shared/email.js`

---

## Common Issues

### Vuetify + SSR

- `vuetify` must be in `ssr.noExternal` in `vite.config.js`
- `createApplicationVuetify(ssr)` must receive `ssr = true` on server side

### Session not persisting

- Check `COOKIE_SECRET` is set
- In dev: `secure: false` (no HTTPS), in prod: `secure: true` requires HTTPS
- `saveUninitialized: false` — session only saved after `req.session.userId` is set

### MongoDB connection

- Docker: use service name as host (`e-xode-mongo-vue-ssr`)
- Atlas: use `MONGO_TYPE=mongodb+srv` and full host
- Connection tested at startup; server exits if DB unavailable

### Rate limit 429

- Auth endpoints: 10 requests per 15 minutes per IP
- Use a different IP or wait for window to expire in tests

### ESLint errors to know

- **`no-empty`**: empty `catch {}` blocks must contain at least a comment
- **`vue/no-duplicate-attributes`**: `<v-btn icon :icon="mdi...">` is invalid — remove the boolean `icon` attribute, keep only `:icon="..."`
- **`vue/v-slot-style`**: use `#slotName` shorthand instead of `v-slot:slotName`

---

## Project Conventions

- **No TypeScript** — pure ES Modules (`"type": "module"`)
- **No comments in code** — code should be self-explanatory (except empty catch blocks: add a short comment)
- **Imports**: use `@/` for src alias in frontend, `#src/` for Node imports
- **Error keys**: always use i18n dot-notation keys (e.g. `'error.auth.invalidCode'`) in API responses
- **Async/await**: preferred over `.then()` chains
- **No default exports for stores/composables** — use named exports
- **Security**: never log passwords, tokens, or session IDs
- **i18n mandatory**: all user-visible text in Vue components must be externalized as i18n keys — never hardcode strings in templates; always add the key to both `src/translate/en.json` and `src/translate/fr.json`
- **Template formatting**: each HTML attribute on its own line when an element has more than one attribute; element content on its own line (enforced by `npm run lint` auto-fix)
