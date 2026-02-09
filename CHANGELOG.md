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

## [Unreleased]

### Added
- Support pour TypeScript (en travail)
- OAuth2 integration avec Google/GitHub (planifié)
- Two-factor authentication (planifié)
- API docs auto-generated avec Swagger (planifié)
- Email templates customizables (planifié)
- E2E tests avec Playwright (planifié)
- Integration tests pour API endpoints (planifié)

### Changed
- (À venir)

### Deprecated
- (none)

### Removed
- (À venir)

### Fixed
- (À venir)

### Security
- (À venir)

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
