# Changelog

Tous les changements notables de ce projet seront documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce project adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning

- **MAJOR**: Changes incompatibles
- **MINOR**: Nouvelles features compatibles backwards
- **PATCH**: Bugfixes compatibles

Format: `MAJOR.MINOR.PATCH` (e.g. `1.2.3`)

---

## [2.0.0] - 2026-03-08

### Added

- **Contact page** — `ContactView.vue` + `POST /api/contact` with rate limiting (3/15min), validation, logEvent
- **Locale-prefixed routing** — All routes now use `/:locale(en|fr)/` prefix for SEO-friendly URLs
- **`useLocalePath` composable** — `localePath(path)`, `switchLocale(code)`, `locale` computed for all views
- **`shared/dbHelpers.js`** — `parseObjectId()`, `parsePagination()`, `findUserSafe()`, `getUserWithCounts()`
- **`shared/utils.js`** — `escapeHtml()` function for SSR meta tags
- **`__APP_VERSION__`** — Build-time constant from package.json via vite.config.js
- **`@root` alias** — Vite alias for project root files
- **Contact i18n keys** — `contact.*`, `nav.contact`, `meta.contact.*` (EN/FR)
- **Missing auth i18n keys** — `forgotPassword.description/sentHint/enterCode/resend`, `resetPassword.passwordMismatch/description`, `error.invalidEmail/missingFields/messageTooLong`

### Changed

- **SCSS externalized** — All component styles extracted to separate `.scss` files (8 files)
- **`entry-server.js`** — Meta titles/descriptions resolved via `i18n.global.t()`, hreflang for all LOCALE_CODES, `og:locale:alternate` tags
- **`entry-client.js`** — `afterEach` + `isReady` hooks sync `route.params.locale` → i18n → localStorage
- **`router.js`** — Complete rewrite: `localeRoutes[]` under `/:locale(en|fr)/` parent, root redirect based on localStorage → browser language → default
- **`TheHeader.vue`** — Language switcher with SVG flag dropdowns, uses `useLocalePath`
- **`TheFooter.vue`** — Contact link added, uses `useLocalePath`
- **All views** — Updated to use `localePath()` for all navigation links
- **`vite.config.js`** — Reads package.json for `__APP_VERSION__` define
- **`shared/const.js`** — Added `DEFAULT_LOCALE`, expanded `USER_SAFE_PROJECTION`
- **`shared/api.js`** — Added `safeJson()`, FormData support, rate-limit detection (`isRateLimit`)
- **`api/router.js`** — Added `contactLimiter` (3/15min), `setupContactRoute`
- **`auth/me.js`** — Uses `getUserWithCounts` from dbHelpers
- **`auth/changePassword.js`** — Destroys other sessions after password change
- **`auth/changeEmail.js`** — Destroys other sessions after email verification
- **Version** — Bumped to 2.0.0

### Fixed

- **SSR 404 status** — `entry-server.js` now returns `statusCode` from route meta, `server.js` uses it
- **`signout.js` ObjectId** — Converts `req.session.userId` to ObjectId before `logEvent`
- **Missing i18n keys** — Added all missing keys for auth, contact, and error messages

### Security

- **`email.js` crypto** — `Math.random()` → `crypto.randomInt()`, base64 → SHA-256 hex, string compare → `timingSafeEqual`
- **`destroyUserSessions`** — Added `excludeSessionId` param to keep current session alive
- **Helmet CSP** — Configured Content-Security-Policy (was disabled)
- **COOKIE_SECRET validation** — Server refuses to start in production if missing or default value

---

## [1.5.1] - 2026-03-07

### Added

- **`verify.submit`** — New i18n key (EN/FR): `"Verify"` / `"Vérifier"`
- **`verify.timerExpiring`** — New i18n key (EN/FR): countdown display `"Expires in {minutes}:{seconds}"`
- **`verify.codeExpired`** — New i18n key (EN/FR): shown when the 10-min code expires
- **`verify.attemptsRemaining`** — New i18n key (EN/FR): `"{remaining} attempt(s) remaining"` warning
- **`verify.noCode`** — New i18n key (EN/FR): `"Didn't receive a code?"`

### Changed

- **`src/views/Auth/VerifyCodeView.vue`** — Complete UI rewrite: 6 individual digit input boxes (auto-focus to next, backspace navigates to previous, paste extracts digits); 10-minute countdown timer with `v-progress-linear` (turns orange at < 2 min); attempts remaining warning; submit button disabled until all 6 digits are filled; resend timer and expiry timer correctly restarted on code resend; `<style scoped>` with Vuetify theme-aware CSS variables for border colors
- **`src/stores/auth.js`** — `verifyCode()` error return now includes `attempts` field from API response (remaining attempts after wrong code)

---

## [1.5.0] - 2026-03-06

### Added

- **`error.auth.waitBeforeResend`** — New i18n key (EN/FR): `"Please wait {seconds} seconds before requesting a new code"`
- **`error.auth.noVerificationPending`** — New i18n key (EN/FR) returned when `POST /api/auth/resend-code` is called with no pending verification

### Changed

- **`src/shared/logger.js`** — `logEvent()` error catch now logs via `console.error('logEvent error:', err)` instead of silently ignoring DB failures (ported from vitapulse)
- **`src/api/middleware.js`** — `requireAuth` is now async; added `setMiddlewareDb(db)` export and `isBlocked` check: if `user.isBlocked === true`, the session is destroyed and a `403 error.auth.blocked` is returned on every authenticated request (ported from vitapulse)
- **`src/api/router.js`** — Calls `setMiddlewareDb(db)` at init so `requireAuth` has DB access for the blocked-user check
- **`src/api/auth/resendCode.js`** — Guard added for missing `securityCode`/`securityCodeExpires` (returns `error.auth.noVerificationPending`); cooldown calc uses vitapulse-style `lastCodeTime` derivation; 429 response now includes `waitSeconds` field; event name changed to `auth-resend-code`; error key changed to `waitBeforeResend`
- **`src/views/Auth/VerifyCodeView.vue`** — Resend success timer corrected from hardcoded `60s` to `30s` (matches `RESEND_COOLDOWN_MS`); on 429 error, `data.waitSeconds` from API is used to set the countdown; extracted `startResendTimer()` helper to remove duplication
- **`package.json`** — Version bumped to `1.5.0`

---

## [1.4.0] - 2026-03-02

### Added

#### Avatar Upload

- **`src/api/auth/avatar.js`** — `POST /api/auth/avatar` (multer, 2MB limit, jpg/png/webp) + `DELETE /api/auth/avatar`
- Avatar stored in `public/uploads/avatars/` with UUID filename; old avatar deleted on upload
- `user.avatar` field in MongoDB — stores relative path `/uploads/avatars/[uuid].[ext]`
- **Avatar section in `AccountView.vue`** — `v-avatar` with initials fallback, upload button, delete button (visible only when avatar exists)
- **`account.avatar.upload`** — New i18n key EN/FR
- `logEvent` calls: `user-update-avatar`, `user-delete-avatar`

#### Shared Constants & Helpers

- **`SUPPORTED_LOCALES`** — Array of `{ code, intl, og, label, flag }` objects (EN, FR)
- **`LOCALE_CODES`** — `['en', 'fr']` derived from `SUPPORTED_LOCALES`
- **`LOCALE_ROUTE_REGEX`** — `'en|fr'` for router pattern matching
- **`getIntlLocale(locale)`** — Returns IETF locale string (e.g. `'fr-FR'`)
- **`getOgLocale(locale)`** — Returns OG locale string (e.g. `'fr_FR'`)
- **`isAdmin(user)`** — Returns `user?.type === 'admin'`

### Changed

- **`src/api/router.js`** — Rate limiters now disabled in development (`NODE_ENV !== 'production'`); no-op middleware `(req, res, next) => next()` replaces rate-limit in dev
- **`AccountView.vue`** — Fixed i18n key mismatches from initial generation: `account.profile.saveSuccess` (was `success`), `account.email.changeSuccess` (was `success`), `account.email.new` (was `newEmail`), `error.auth.passwordsDoNotMatch` (was `resetPassword.passwordMismatch`)
- **`package.json`** — Version bumped to `1.4.0`

### Fixed

- **AccountView.vue i18n keys** — `account.tabs.*`, `account.password.submit` were missing from translation files; added to `en.json` and `fr.json`

---

## [1.3.0] - 2026-03-01

### Added

#### Account Management

- **`AccountView.vue`** — 3-tab page at `/account` (profile, email, password)
- **`PUT /api/auth/profile`** — Update display name
- **`POST /api/auth/change-password`** — Change password (requires current password)
- **`POST /api/auth/change-email`** — Request email change (sends verification code to new address)
- **`POST /api/auth/verify-email-change`** — Confirm email change with code
- **Account i18n keys** — `account.*` in EN/FR (`account.profile.*`, `account.email.*`, `account.password.*`)

#### Password Reset Flow

- **`ForgotPasswordView.vue`** — Request a reset code via email at `/forgot-password`
- **`ResetPasswordView.vue`** — Submit email + code + new password at `/reset-password`
- **`POST /api/auth/forgot-password`** — Sends reset code; always returns `{ status: 'sent' }` (privacy)
- **`POST /api/auth/reset-password`** — Validates `resetPasswordPending` flag + code, then updates password
- **`resetPassword` email template** — EN/FR HTML email with reset code
- **`emailChangeCode` email template** — EN/FR HTML email for email change confirmation
- **`forgotPassword.*`, `resetPassword.*` i18n keys** — EN/FR translations

#### Event Logging

- **`src/shared/logger.js`** — `logEvent(db, {event, userId, ip, meta})` — fire-and-forget writes to `logs` collection
- **`AdminLogsView.vue`** — Admin page at `/admin/logs`: filters (event type, date range, search), pagination, bulk delete
- **`GET /api/admin/logs`** — Paginated, filterable logs list
- **`GET /api/admin/logs/events`** — List of distinct event types (for filter dropdown)
- **`DELETE /api/admin/logs/:id`** — Delete single log entry
- **`DELETE /api/admin/logs`** — Bulk delete selected log entries
- **`admin.logs.*` i18n keys** — EN/FR translations

#### IP Security

- **`src/shared/security.js`** — `getClientIp`, `isIpBlocked`, `recordLoginIp` (stores last 50 IPs in `user.loginHistory`), `destroyUserSessions`
- **`blockedIps` MongoDB collection** — Managed via admin API
- **`GET /api/admin/blocked-ips`** — List blocked IPs
- **`POST /api/admin/blocked-ips`** — Add IP to blocklist
- **`DELETE /api/admin/blocked-ips/:ip`** — Remove IP from blocklist
- **IP check at signin** — Blocked IPs get 403 before password check
- **IP check at verifyCode** — Blocked IPs get 403

#### Admin Enhancements

- **`PUT /api/admin/users/:id/block`** — Block user (sets `isBlocked: true`) + optionally blocks their IPs
- **`PUT /api/admin/users/:id/unblock`** — Unblock user (sets `isBlocked: false`) + optionally unblocks IPs
- **Block dialog in `AdminUserDetailView.vue`** — Confirmation dialog with "block IPs" checkbox
- **Blocked badge in `AdminUsersView.vue`** — Red chip on blocked users in the list
- **Recent activity in `AdminUserDetailView.vue`** — Last 10 events from `logs` collection for this user
- **`admin.users.blocked`, `admin.users.block`, `admin.users.unblock`, `admin.users.blockConfirm.*`** — New i18n keys

#### New i18n Keys

- `nav.account`
- `form.currentPassword`, `form.newPassword`, `form.confirmPassword`, `form.showPassword`
- `error.auth.blocked`, `error.auth.invalidPassword`, `error.auth.passwordsDoNotMatch`, `error.auth.sameEmail`, `error.auth.invalidEmail`, `error.auth.resendTooSoon`, `error.auth.resetNotPending`
- `meta.forgotPassword.title`, `meta.resetPassword.title`, `meta.account.title`, `meta.admin.logs.title`
- `index.features.account.*`, `index.features.logging.*`, `index.features.ipSecurity.*`

#### Landing Page

- **3 new feature cards** on `IndexView.vue`: Account Management, Event Logging, IP Security

### Changed

- **`src/shared/const.js`** — Added `BCRYPT_ROUNDS = 10`, `RESEND_COOLDOWN_MS = 30000`, `USER_SAFE_PROJECTION = { password: 0 }`, `EMAIL_REGEX`; reduced `SECURITY_CODE_MAX_ATTEMPTS` from `5` to `3`
- **`src/shared/email.js`** — Fixed `verifyCode` bug; added `sendEmailChangeCodeEmail`, `sendResetPasswordEmail`
- **`signin.js`** — Added IP block check, `isBlocked` user check, `logEvent` for `auth-failed` and `user-signin`
- **`verifyCode.js`** — Added IP block check, `isBlocked` check; uses `SECURITY_CODE_MAX_ATTEMPTS` constant; adds `recordLoginIp`; logEvent
- **`signup.js`** — Uses `BCRYPT_ROUNDS` constant; logs `user-signup`
- **`signout.js`** — Now takes `(app, db)` to support logEvent; adds `res.clearCookie('app.sid')`; logs `user-signout`
- **`resendCode.js`** — Added 30s cooldown check (`RESEND_COOLDOWN_MS`); logs `resend-code`
- **`api/router.js`** — Added `accountLimiter` (20 req / 15 min); registered all new auth routes + `setupAdminLogsRoute`
- **`router.js`** — Added routes: `/forgot-password`, `/reset-password`, `/account`, `/admin/logs`
- **`admin/users.js`** — Added block/unblock/blocked-ips endpoints, `recentLogs` in detail response, `ObjectId.isValid` guards, logEvent
- **`package.json`** — Version bumped to `1.3.0`; updated `express-rate-limit` to `^8.2.1`, `mongodb` to `^7.1.0`, `vue-router` to `^5.0.3`, `vuetify` to `^4.0.0`; added `multer ^2.1.0`

### Security

- **Fixed `verifyCode` authentication bug** — code verification was always failing due to inverted hash comparison
- **IP tracking** — Login IPs recorded on successful authentication; blocked IPs rejected before credential check
- **User blocking** — `isBlocked` field checked at signin and verifyCode; admin can block/unblock with optional IP block

---

## [1.2.2] - 2026-02-22

### Changed

- **Node.js** minimum version bumped from `>=18.0.0` to `>=22.0.0`
- **package.json** version aligned to `1.2.1`

---

## [1.2.1] - 2026-02-22

### Security

- **nodemailer** upgraded from `^6.9.7` to `^8.0.1`
- **happy-dom** upgraded from `^14.12.3` to `^20.7.0`
- **eslint** upgraded from `^9.0.0` to `^10.0.1`
- **eslint-plugin-vue** upgraded from `^9.0.0` to `^10.8.0`
- **bn.js** forced to `^5.2.3` via npm overrides
- **minimatch** forced to `^10.2.2` via npm overrides

### Changed

- **eslint.config.js** — migrated to eslint-plugin-vue 10.x flat config format (`flat/recommended`)
- **server.js** — added comment in empty catch block to satisfy ESLint `no-empty` rule
- **TheHeader.vue** — removed duplicate `icon` attribute on `v-btn`

---

## [1.2.0] - 2026-02-22

### Added

- **Admin panel** — User management at `/admin/users` and `/admin/users/:userId`
- **Admin API** — `GET/PUT/DELETE /api/admin/users[/:id]`
- **`requireAdmin` middleware** — DB-verified role check
- **Rate limiting** — `express-rate-limit` on all auth endpoints (10 req / 15 min)
- **Helmet** — Security HTTP headers
- **`src/shared/const.js`** — Centralized constants
- **`src/shared/api.js`** — Generic `apiFetch()` wrapper
- **Full router navigation guards** — `requiresAuth`, `guest`, `requiresAdmin`
- **`isAdmin` computed** in `useAuthStore`
- **Welcome email** + **Contact email** with EN/FR templates
- **Enhanced SSR SEO** — OpenGraph, Twitter Card, hreflang, Schema.org JSON-LD
- **`IndexView.vue`** — Rich landing page with 6 feature cards
- **`CLAUDE.md`** — Project reference guide

### Changed

- **`generateSecurityCode()`** — Changed from `async` to synchronous
- **`server.js`** — Cookie name `app.sid`, `saveUninitialized: false`

---

## [1.1.0] - 2026-02-08

### Added

- **Vitest integration** — 9 test suites, 50+ test cases
- **ESLint + Prettier integration** — Vue 3 recommended rules

---

## [1.0.0] - 2024-01-15

### Added

- Vue 3 + SSR + Vite + Express initial release
- Authentication flow: signup, signin, verify-code, resend-code, signout
- MongoDB integration, session management, email delivery
- Docker support, GitHub Actions CI/CD
