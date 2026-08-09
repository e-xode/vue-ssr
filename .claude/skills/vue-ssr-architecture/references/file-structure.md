# File structure

```
server.js                       # Express entry (SSR, Helmet, CSP, sessions, static, graceful shutdown, sitemap)
vite.config.js                  # __APP_VERSION__, @ / @root / #src aliases, SCSS auto-inject
eslint.config.js                # Flat config ESLint 10
vitest.config.js                # Vitest config
docker-compose.yml              # Dev base: app only (remote DB via .env)
docker-compose.local.yml        # Dev override: local mongo + redirect (COMPOSE_FILE)
docker/build/Dockerfile         # Multi-stage production build (there is no root Dockerfile)

src/
  main.js                       # createApp() - Vue + Vuetify + Pinia + i18n + Router
  entry-client.js               # Client hydration + locale sync (afterEach, isReady)
  entry-server.js               # SSR render + SEO meta + hreflang + Schema.org
  router.js                     # Routes with /:locale(en|fr)/ prefix + guards
  App.vue + App.scss            # Root component with layout system
  style.css                     # Global CSS reset

  api/
    router.js                   # exports createApiRouter(db) -> express.Router (rate limiters + routes)
    middleware.js               # requireAuth, requireAdmin middleware
    auth/                       # 12 auth endpoints (signup, signin, verify, etc.)
    contact/send.js             # POST /api/contact (rate limited 3/15min)
    admin/                      # users.js + logs.js

  shared/
    analytics.js                # Google Analytics gtag injection
    api.js                      # apiFetch() client fetch wrapper
    captcha.js                  # Server-side reCAPTCHA v3 verification
    const.js                    # All constants
    dbHelpers.js                # parseObjectId, parsePagination, findUserSafe, getUserWithCounts
    email.js                    # Code gen/hash/verify, email sending
    log.js                      # logInfo, logWarn, logError, logDebug
    logger.js                   # logEvent(db, event, meta)
    mongo.js                    # mongoConnect(), mongoClose() — pooled singleton client
    sanitize.js                 # sanitize(), isEmptyHtml() — sanitize-html allowlist wrapper
    security.js                 # getClientIp, isIpBlocked, recordLoginIp, destroyUserSessions
    theme.js                    # SSR-safe light/dark theme cookie parsing
    utils.js                    # escapeHtml()

  composables/
    useCaptcha.js                # Client-side reCAPTCHA v3
    useConsent.js                # Cookie consent (GDPR) + Google Consent Mode signals
    useLocalePath.js             # localePath(path), switchLocale(code)

  stores/
    auth.js                      # useAuthStore
    index.js                     # Store exports

  plugins/vuetify.js             # Vuetify config (light/dark themes, icons)
  styles/                        # variables.scss + mixins.scss (auto-injected)
    _typography.scss             # Base typography (injected)
    _animations.scss             # Keyframe animations library — NOT in the injection chain (inert)
    _utilities.scss              # Gradient, glass, badge, skeleton utilities — inert (same reason)
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

tests/unit/                     # Vitest suite — see tests/unit/ for the current file list
public/                         # Static assets + uploads/avatars/
```

`AuthShell.vue` is the shared layout for Auth views — reuse it rather than duplicating shell markup
when adding a new auth-adjacent view. Auth views intentionally do NOT each carry their own `.scss`
file (unlike the rest of the project's one-`.scss`-per-view convention): they share `AuthShell.scss`
except `VerifyCodeView`, which has enough unique markup to warrant its own file.
