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
- **`src/shared/email.js`** — Fixed `verifyCode` bug (was inverted: `hashCode(storedHash) === input` → now `storedHash === Buffer.from(input).toString('base64')`); added `sendEmailChangeCodeEmail`, `sendResetPasswordEmail`
- **`signin.js`** — Added IP block check, `isBlocked` user check, `logEvent` for `auth-failed` and `user-signin`
- **`verifyCode.js`** — Added IP block check, `isBlocked` check; uses `SECURITY_CODE_MAX_ATTEMPTS` constant; adds `recordLoginIp`; uses `USER_SAFE_PROJECTION`; logEvent
- **`signup.js`** — Uses `BCRYPT_ROUNDS` constant instead of hardcoded `10`; logs `user-signup`
- **`signout.js`** — Now takes `(app, db)` to support logEvent; adds `res.clearCookie('app.sid')`; logs `user-signout`
- **`resendCode.js`** — Added 30s cooldown check (`RESEND_COOLDOWN_MS`); logs `resend-code`
- **`api/router.js`** — Added `accountLimiter` (20 req / 15 min); registered all new auth routes + `setupAdminLogsRoute`
- **`router.js`** — Added routes: `/forgot-password`, `/reset-password`, `/account`, `/admin/logs`
- **`admin/users.js`** — Added block/unblock/blocked-ips endpoints, `recentLogs` in detail response, `ObjectId.isValid` guards, logEvent
- **`CLAUDE.md`** — Updated version, stack table, directory structure, user model, security limits, email templates, conventions
- **`package.json`** — Version bumped to `1.3.0`; updated `express-rate-limit` to `^8.2.1`, `mongodb` to `^7.1.0`, `vue-router` to `^5.0.3`, `vuetify` to `^4.0.0`; added `multer ^2.1.0`

### Security

- **Fixed `verifyCode` authentication bug** — existing code made code verification always fail (comparing `hashCode(storedHash)` against raw user input instead of `storedHash` against `base64(input)`)
- **IP tracking** — Login IPs recorded on successful authentication; blocked IPs rejected before credential check
- **User blocking** — `isBlocked` field checked at signin and verifyCode; admin can block/unblock with optional IP block

---

## [1.2.2] - 2026-02-22

### Changed

- **Node.js** minimum version bumped from `>=18.0.0` to `>=22.0.0` (aligns with Docker image `node:22-slim`)
- **package.json** version aligned to `1.2.1`

---

## [1.2.1] - 2026-02-22

### Security
- **nodemailer** upgraded from `^6.9.7` to `^8.0.1` — fixes email domain interpretation conflict and addressparser DoS (GHSA-mm7p-fcc7-pg87, GHSA-rcmh-qjqh-p98v)
- **happy-dom** upgraded from `^14.12.3` to `^20.7.0` — fixes VM context escape allowing server-side code execution (GHSA-96g7-g7g9-jxw8, GHSA-37j7-fg3j-429f)
- **eslint** upgraded from `^9.0.0` to `^10.0.1` — fixes minimatch ReDoS via repeated wildcards (GHSA-3ppc-4f35-3m26)
- **eslint-plugin-vue** upgraded from `^9.0.0` to `^10.8.0`
- **bn.js** forced to `^5.2.3` via npm overrides — fixes infinite loop in transitive dependency chain `session-file-store → kruptein → asn1.js` (GHSA-378v-28hj-76wf)
- **minimatch** forced to `^10.2.2` via npm overrides — fixes ReDoS in transitive devDependency chain `@vue/test-utils → js-beautify → editorconfig`

### Changed
- **eslint.config.js** — migrated to eslint-plugin-vue 10.x flat config format (`flat/recommended`)
- **server.js** — added comment in empty catch block to satisfy ESLint `no-empty` rule
- **TheHeader.vue** — removed duplicate `icon` attribute on `v-btn` (ESLint `vue/no-duplicate-attributes`)

---

## [1.2.0] - 2026-02-22

### Added
- **Admin panel** — User management at `/admin/users` and `/admin/users/:userId` (list, edit, delete)
- **Admin API** — `GET /api/admin/users`, `GET /api/admin/users/:id`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`
- **`requireAdmin` middleware** — DB-verified role check (`type === 'admin'`) on all admin routes
- **Rate limiting** — `express-rate-limit` on all auth endpoints (10 req / 15 min)
- **Helmet** — Security HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- **`src/shared/const.js`** — Centralized constants (`SECURITY_CODE_EXPIRY_MS`, `SECURITY_CODE_MAX_ATTEMPTS`, `USER_TYPES`)
- **`src/shared/api.js`** — Generic `apiFetch()` wrapper for frontend API calls with error handling
- **Full router navigation guards** — `requiresAuth`, `guest`, `requiresAdmin` with automatic redirect
- **Admin nav link** — Conditionally visible in header for admin users only (`mdiShieldAccount`)
- **`isAdmin` computed** in `useAuthStore` Pinia store
- **Welcome email** — `sendWelcomeEmail()` + EN/FR templates
- **Contact email** — `sendContactEmail()` + EN/FR templates
- **Enhanced SSR SEO** — OpenGraph, Twitter Card, hreflang, Schema.org JSON-LD, Apple meta tags
- **`<!--app-lang-->` SSR placeholder** — Dynamic `lang` attribute injection in `index.html`
- **Admin i18n keys** — Full EN/FR translations for admin UI (`admin.*`)
- **`verify.*` i18n keys** — Proper i18n for verify-code view
- **`dashboard.*` i18n keys** — Welcome message and subtitle
- **`form.save`, `form.delete`** — Added missing form keys
- **`error.forbidden`, `error.tooManyRequests`, `error.admin.*`** — New error keys
- **`IndexView.vue`** — Rich landing page: hero section, 6 feature cards (SSR/Auth/i18n/Admin/UI/Security), tech stack chips, open source section with GitHub link
- **`index.*` i18n keys** — Full EN/FR translations for the landing page (hero, features, stack, opensource)
- **`CLAUDE.md`** — Complete project reference guide for AI-assisted development sessions

### Changed
- **`generateSecurityCode()`** — Changed from `async` to synchronous
- **`signup.js`** — User document now includes `type: 'user'` at creation
- **`signin.js`, `resendCode.js`** — Use `SECURITY_CODE_EXPIRY_MS` constant
- **`requireAuth` middleware** — Now also sets `req.userId` as `ObjectId`
- **`server.js`** — Cookie name `app.sid`, `saveUninitialized: false`, session cleanup on production start
- **`TheHeader.vue`** — Admin menu item, signout redirects to `/signin`
- **`DashboardView.vue`** — Improved with welcome message and admin quick-access card
- **`VerifyCodeView.vue`** — Resend button uses `verify.*` i18n keys

---

## [1.1.0] - 2026-02-08

### Added

#### Testing Infrastructure
- **Vitest integration** - Lightweight, fast test framework with Vite support
  - 9 comprehensive test suites with 50+ test cases
  - Component testing with @vue/test-utils and @testing-library/vue
  - happy-dom for lightweight DOM implementation
  - Coverage reporting with v8 provider
  - Interactive test UI with @vitest/ui
- **Test suites included**:
  - Utilities testing (logging, email generation, hashing)
  - State management testing (Pinia auth store)
  - Router configuration validation
  - Component rendering tests
  - Data validation tests
  - API utilities and endpoint validation tests
- **npm scripts**: `npm test`, `npm run test:run`, `npm run test:ui`, `npm run test:coverage`
- **Test documentation** in TESTING.md with best practices and examples

#### Code Quality & Linting
- **ESLint + Prettier integration**:
  - Vue 3 recommended rules configuration
  - Automatic code formatting with Prettier
  - Zero conflict between ESLint and Prettier
  - Smart environment detection (dev vs production)
- **Configuration files**:
  - .eslintrc.js with Vue 3 best practices
  - .prettierrc.json with consistent formatting rules
  - .eslintignore for build artifacts and dependencies
- **npm scripts**: `npm run lint` (fix issues), `npm run lint:check` (verify)
- **Pre-commit ready** for CI/CD integration

### Changed
- Updated package.json with 5 new devDependencies (Vitest, ESLint, Prettier, Vue Test Utils, Testing Library)
- Enhanced npm scripts with testing and linting commands
- Updated .gitignore to exclude coverage and .vitest directories
- Documentation updated to reflect new testing and linting workflows

### Security
- Verified all 50+ tests pass successfully
- Linting checks enforce security best practices
- Production-ready code quality standards

---

## [1.0.0] - 2024-01-15

### Added

#### Frontend Features
- Vue 3 avec Composition API
- Server-Side Rendering (SSR) avec hydratation
- Vue Router 4 avec lazy loading des routes
- Pinia state management
- Vuetify 3 Material Design components
- Vue i18n pour FR/EN internationalization
- Responsive design mobile-first
- Dark mode support (Vuetify)
- Forme de signup avec validation
- Forme de signin avec validation
- Page de vérification de code 6 chiffres
- Dashboard protégé pour utilisateurs authentifiés
- Navigation avec menu utilisateur
- Layout switching (public/minimal/app)
- Error pages (404, 500)
- Loading states et skeletons

#### Backend Features
- Express.js server avec SSR support
- API RESTful pour authentification
  - `POST /api/auth/signup` - Créer compte
  - `POST /api/auth/signin` - Connexion
  - `POST /api/auth/verify-code` - Vérifier code
  - `POST /api/auth/resend-code` - Renvoyer code
  - `GET /api/auth/me` - Utilisateur courant
  - `POST /api/auth/signout` - Déconnexion
- Session management avec express-session
- Password hashing avec bcryptjs (salt: 10)
- Email delivery via Nodemailer
- Security codes (6 chiffres, 5 min expiry)
- MongoDB integration
- CORS configuration
- Rate limiting sur endpoints sensibles
- Error handling global
- Logging system

#### Database
- MongoDB support
- User collection with indexes
- Sessions collection
- User schema:
  - email (unique)
  - passwordHash
  - name
  - verified flag
  - securityCode (temporary)
  - securityCodeExpires (temporary)
  - createdAt, updatedAt

#### Styling
- SCSS variables system (spacing, colors, shadows)
- SCSS mixins (flex, transitions, responsive)
- Material Design tokens
- Vuetify theme customization
- Global styles reset

#### Infrastructure
- Docker support (dev + production)
- Multi-stage Docker build
- Docker Compose setup
- GitHub Actions CI/CD
  - Auto-build on push
  - Push to registry
- Vite build optimization
- Tree-shaking enabled
- Code splitting
- Asset versioning with hashes

#### Configuration
- Environment variables template
- .gitignore configured
- Vite config avec SSR optimization
- Vuetify plugin avec theme
- Vue Router config avec meta tags
- Pinia stores setup

#### Documentation
- README.fr.md (documentation française)
- README.en.md (documentation anglaise)
- docs/ARCHITECTURE.md (architecture détaillée)
- docs/QUICK_START.fr.md (guide 5 min français)
- docs/QUICK_START.en.md (guide 5 min anglais)
- docs/DEVELOPER_GUIDE.md (guide développeur)
- docs/AUTHENTICATION.md (système d'authentification)
- docs/API.md (référence API)
- docs/DEPLOYMENT.md (déploiement production)
- docs/TROUBLESHOOTING.md (dépannage)
- CONTRIBUTING.md (guide contribution)
- LICENSE (MIT)
- CHANGELOG.md (ce fichier)

#### Development Tools
- npm scripts:
  - `npm run dev` - Development server
  - `npm run build` - Production build
  - `npm run prod` - Run production build
- Development environment variables
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps

### Security
- Password hashing avec bcryptjs
- Session-based authentication
- HTTP-only cookies
- CSRF protection (SameSite strict)
- CORS configuration
- Rate limiting
- No sensitive data in logs
- Secure session secrets

### Performance
- SSR rendering côté serveur
- Code splitting par route
- CSS code splitting
- Asset optimization
- Gzip compression (Docker)
- Production build ~400KB bundle

### Testing
- Manual testing guide included
- Signup/signin/verify flow testé
- Email sending verfié
- Session persistence testé

### Known Limitations
- No real-time features (WebSocket)
- No file uploads yet
- No advanced analytics
- No email template builder UI
- No payment integration
- No 2FA
- Basic rate limiting (à améliorer)

### Breaking Changes
- None (initial release)

### Migration Guide
- N/A (initial release)

### Deprecations
- None

### Contributors
- Initial development team

---

## [Next Major Version] (Planning)

### Planned Features

#### v1.1.0 (Next Minor)
- [ ] User profile edit
- [ ] Account settings
- [ ] Password reset flow
- [ ] Email verification reminder
- [ ] Better email templates
- [ ] User activity logging

#### v2.0.0 (Major)
- [ ] TypeScript migration
- [ ] GraphQL API (in addition to REST)
- [ ] Real-time updates with WebSocket
- [ ] File upload support
- [ ] Advanced user search
- [ ] User roles and permissions
- [ ] Admin dashboard

#### v3.0.0 (Future)
- [ ] Micro-services architecture
- [ ] Multi-tenancy
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] Machine learning integrations

---

## How to Upgrade

### From 1.0.0 to Future Versions

1. **Read CHANGELOG** - Vérifier breaking changes
2. **Pull latest** - `git pull origin main`
3. **Install dependencies** - `npm install`
4. **Read migration guide** - Si applicable
5. **Test locally** - `npm run dev`
6. **Deploy** - Suivre deployment guide

### Rollback Procedure

```bash
# If critical issue found

# Revert to previous version
git revert <commit-hash>

# Or deploy previous release
docker pull registry/app:1.0.0
docker stop app
docker run -d --name app registry/app:1.0.0
```

---

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Pull Requests**: Always welcome!

---

## Release History

### 1.0.0 Release Date: 2024-01-15

- Initial public release
- Full authentication system
- SSR setup
- Production-ready
- Comprehensive documentation

---

## How This Changelog is Maintained

- **Git commits** follow Conventional Commits
- **Releases** tagged as `v1.0.0`, `v1.1.0`, etc.
- **PRs** should update CHANGELOG in "Unreleased" section
- **Major versions** trigger major documentation updates

### Types of Changes

- **Added** pour nouvelles features
- **Changed** pour changements dans features existantes
- **Deprecated** pour soon-to-be features supprimées
- **Removed** pour features supprimées
- **Fixed** pour bugfixes
- **Security** pour security fixes

---

**Last Updated**: 2024-01-15
**Next Review**: Pending contributions
