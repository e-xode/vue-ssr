# File structure

## Contents

- Root files and tooling: server entry, Vite, ESLint, Vitest, Docker
- `src/`: `api/`, `ssr/`, `shared/`, `composables/`, `directives/`, `stores/`, `views/`, `components/`, `styles/`, `translate/`
- `tests/` and `public/`

```
server.js                       # Thin Express wiring: boot checks, mongo, then src/api/http/* modules
vite.config.js                  # __APP_VERSION__, @ / @root / #src aliases, SCSS auto-inject
eslint.config.js                # Flat config ESLint 10
vitest.config.js                # Vitest: `server` (node) and `client` (happy-dom) projects
docker-compose.yml              # Dev base: app only (remote DB via .env)
docker-compose.local.yml        # Dev override: local mongo + redirect (COMPOSE_FILE)
docker/build/Dockerfile         # Multi-stage production build (there is no root Dockerfile)

src/
  main.js                       # createApp({ theme, locale, initialState }) -> { app, router, pinia, i18n, vuetify, setLocale }; exports interLatinFontUrl
  entry-client.js               # Client hydration from __SSR_STATE__ + locale/title sync + analytics
  entry-server.js               # render(url, db, theme): route prefetch, renderToString, state
  ssr/head.js                   # generateHead(): meta, canonical, hreflang, OG/Twitter, JSON-LD, config <meta> tags
  router.js                     # Routes with /:locale(en|fr)/ prefix + guards
  App.vue + App.scss            # Root component with layout system
  style.css                     # Global CSS reset

  api/
    router.js                   # exports createApiRouter(db) -> express.Router (rate limiters + routes)
    middleware.js               # requireAuth (session lifetime + blocked check), requireAdmin
    emailDelivery.js            # deliverEmail(res, sending) -> 502 error.emailFailed on failure
    http/                       # HTTP-host modules wired by server.js
      constants.js csp.js hardening.js session.js indexes.js
      readiness.js shutdown.js redirects.js seo.js static.js
      dev.js ssr.js template.js
    auth/                       # 12 auth endpoints (signup, signin, verify, etc.)
    contact/send.js             # POST /api/contact (rate limited 3/15min)
    admin/                      # users.js + logs.js

  shared/
    analytics.js                # Client GA4 (reads <meta name="ga-id">, consent defaults)
    api.js                      # apiFetch() client fetch wrapper
    captcha.js                  # Server-side reCAPTCHA v3 verification
    clientConstants.js          # Meta names, script URLs, SSR state id, reveal settings
    const.js                    # Constants (sessions, security codes, avatars, log levels, locales)
    dbHelpers.js                # parseObjectId, parsePagination, findUserSafe, getUserWithCounts
    email.js                    # Code gen/hash/verify, email sending
    localizedRoutes.js          # PAGES (localized slugs) + path helpers, shared by router/redirects/sitemap/head
    log.js                      # logInfo, logWarn, logError, logDebug (LOG_LEVEL)
    logger.js                   # logEvent(db, { event, userId, ip, meta })
    mongo.js                    # mongoConnect(), mongoClose() - pooled singleton client
    sanitize.js                 # sanitize(), isEmptyHtml() - sanitize-html allowlist wrapper
    security.js                 # getClientIp, ban checks, session helpers, recordLoginIp, destroyUserSessions
    seoConstants.js             # Sitemap/robots/icon/theme-color constants
    serialize.js                # serializeForScript() for JSON embedded in <script>
    siteUrl.js                  # resolveSiteUrl, assertProductionSiteUrl (NODE_HOST)
    sitemap.js                  # Sitemap XML builder + cache
    ssrState.js                 # readSsrState() (client)
    theme.js                    # Light/dark theme cookie parsing + document theme helpers
    title.js                    # buildTitle()
    utils.js                    # escapeHtml, readString, readEmail, escapeRegex

  directives/
    reveal.js                    # v-reveal scroll-in animation (client only, honours reduced motion)

  composables/
    useCaptcha.js                # Client-side reCAPTCHA v3 (site key from <meta>)
    useConsent.js                # Cookie consent (GDPR) + Google Consent Mode signals
    useLocalePath.js             # localePath(path), switchLocale(code)
    useLogSummary.js             # Admin log summaries (+ logSummaryConstants.js)
    useMetaContent.js            # readMetaContent(name)
    useSsrStatus.js              # setStatusCode(code) on the SSR context
    useSystemTheme.js            # Applies prefers-color-scheme when no theme cookie

  stores/
    auth.js                      # useAuthStore
    index.js                     # Store exports

  plugins/vuetify.js             # createApplicationVuetify(ssr, theme, locale): themes, icons, defaults
  styles/                        # variables.scss + mixins.scss (auto-injected)
    _typography.scss             # Base typography (injected)
    _reveal.scss                 # Styles for the v-reveal directive
    _inject.scss                 # SCSS auto-inject entry (variables + typography + mixins)
  translate/                     # en.json, fr.json, emails/en.js, emails/fr.js
  json/                          # Static JSON fixtures (e.g. users.json)

  components/
    AuthShell.vue + .scss        # Shared shell wrapping every Auth/ view except VerifyCodeView
    CookieConsent/
      CookieConsentBanner.vue + .scss
    layout/
      TheHeader.vue + .scss      # App bar
      TheFooter.vue + .scss      # Footer
      ThemeToggle.vue            # Light/dark toggle (no own .scss)
      index.js                   # Layout exports

  views/
    Index/IndexView.vue + .scss
    Contact/ContactView.vue + .scss
    Auth/                        # Signup, Signin, ForgotPassword, ResetPassword share AuthShell.scss;
                                  # only VerifyCodeView carries its own VerifyCodeView.scss
    Dashboard/DashboardView.vue
    Account/AccountView.vue
    Admin/                       # AdminUsersView, AdminUserDetailView, AdminLogsView
    NotFound/NotFoundView.vue

tests/unit/                     # Vitest suite (api.*/shared.* run in node, the rest in happy-dom)
tests/fixtures/                 # routeHarness.js, mockData.js
public/                         # Static assets + uploads/avatars/
```

`AuthShell.vue` is the shared layout for Auth views — reuse it rather than duplicating shell markup
when adding a new auth-adjacent view. Auth views intentionally do NOT each carry their own `.scss`
file (unlike the rest of the project's one-`.scss`-per-view convention): they share `AuthShell.scss`
except `VerifyCodeView`, which has enough unique markup to warrant its own file.
