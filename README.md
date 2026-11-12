# Vue SSR Starter Kit

[![npm](https://img.shields.io/npm/v/@e-xode/vue-ssr)](https://www.npmjs.com/package/@e-xode/vue-ssr)
[![tests](https://github.com/e-xode/vue-ssr/actions/workflows/npm-test.yml/badge.svg)](https://github.com/e-xode/vue-ssr/actions/workflows/npm-test.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

A production-ready starting point for server-rendered Vue 3 applications: Express 5 SSR, email-code
authentication, an admin panel, English/French i18n, Vuetify 4, MongoDB and Docker, with the security
hardening and the tests already written.

Live demo: <https://vue-ssr.e-xode.net> · Version française : [README.fr.md](./README.fr.md)

## Why this kit

Most Vue SSR templates stop at "hello world rendered on the server". This one ships the parts every
real project ends up writing:

- **Authentication that is finished.** Sign-up, sign-in with a 6-digit email code, password reset,
  email change, avatar upload, session rotation, idle and absolute session lifetimes, IP and account
  blocking.
- **An admin panel.** Users (search, edit, block, delete), blocked IPs, and a filterable audit log.
- **SEO-ready SSR.** Locale-prefixed routes (`/en/…`, `/fr/…`), canonical and `hreflang` links,
  Open Graph, JSON-LD, `sitemap.xml` and `robots.txt`, correct HTTP status codes.
- **Security by default.** Helmet CSP without `unsafe-inline` scripts in production, rate limiting,
  reCAPTCHA v3, hashed codes compared in constant time, typed inputs against NoSQL operator injection.
- **A codebase you can read.** Small modules, no dead code, a thin `server.js`, and 300+ unit tests.

## Stack

| Layer    | Technology                                                             |
| -------- | ---------------------------------------------------------------------- |
| Frontend | Vue 3 (`<script setup>`), Vue Router 5, Pinia 3, Vuetify 4, vue-i18n 11 |
| Server   | Node.js 26, Express 5, Vite 8 (SSR build and dev middleware)           |
| Data     | MongoDB (official driver), file-based sessions                          |
| Email    | Nodemailer (SMTP), console transport in development                     |
| Quality  | Vitest 4, ESLint 10, Prettier 3, GitHub Actions                         |

## Quick start (5 minutes)

Requirements: Docker with the Compose plugin. Nothing else: Node.js and MongoDB run in containers.

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
cp .env.example .env
docker compose up
```

Open <http://localhost:3002>. The first start installs the dependencies and takes a minute or two.

1. **Create an account** on the sign-up page.
2. **Read the security code in the server logs.** No SMTP server is configured in development, so
   emails are not sent: the code is printed in the `docker compose up` output
   (look for a line ending with `code for you@example.com: 123456`).
3. **Make yourself an admin**, then sign out and in again:

   ```bash
   docker compose exec node npm run seed:admin -- you@example.com
   ```

The defaults in `.env.example` work as they are. See [docs/QUICK_START.en.md](./docs/QUICK_START.en.md)
for running without Docker, using a remote MongoDB, or sending real emails.

## Scripts

| Command                    | What it does                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`              | Development server with Vite HMR (loads `.env`)                          |
| `npm run build`            | Client and server production bundles into `dist/`                        |
| `npm start`                | Production server (alias of `npm run prod`); expects production env vars |
| `npm test`                 | Unit tests, once (`npm run test:run` is the same; `test:watch` watches)  |
| `npm run test:coverage`    | Unit tests with a coverage report                                        |
| `npm run lint:check`       | ESLint, read-only (`npm run lint` / `lint:fix` also fixes)               |
| `npm run format:check`     | Prettier, read-only (`npm run format` / `format:write` also writes)      |
| `npm run validate`         | The full battery: lint, format, build and tests, without changing files  |
| `npm run validate:changed` | Same checks limited to what your uncommitted changes touch, with autofix |
| `npm run seed:admin -- <email>` | Promote an existing account to admin                                |

With Docker, prefix a command with `docker compose exec node`, for example
`docker compose exec node npm test`.

## Project layout

```
server.js            Thin Express wiring; the logic lives in src/api/http/
src/api/             REST API: auth/, admin/, contact/, http/ (CSP, sessions, SSR, health…)
src/shared/          Code shared by server and client (constants, helpers, MongoDB, email)
src/views/           Pages; src/components/ holds the layout and shared components
src/stores/          Pinia stores; src/composables/ holds reusable Composition API logic
src/translate/       en.json, fr.json and the email templates
src/styles/          SCSS design tokens (variables.scss) and mixins
tests/unit/          Vitest suites (server and client projects)
docker/              Development and production images
docs/                Guides listed below
```

## Documentation

| Guide                                           | Content                                              |
| ----------------------------------------------- | ---------------------------------------------------- |
| [Quick start](./docs/QUICK_START.en.md)         | Docker and non-Docker setup, first admin, real email |
| [Architecture](./docs/ARCHITECTURE.md)          | Request lifecycle, SSR, routing, file structure      |
| [Developer guide](./docs/DEVELOPER_GUIDE.md)    | Adding a page, an API route, a translation, a store  |
| [API reference](./docs/API.md)                  | Every endpoint, with payloads, errors and limits     |
| [Authentication](./docs/AUTHENTICATION.md)      | Flows, sessions, codes, blocking                     |
| [Deployment](./docs/DEPLOYMENT.md)              | Environment variables, Docker image, production traps |
| [Troubleshooting](./docs/TROUBLESHOOTING.md)    | Common errors and their fixes                        |
| [Testing](./TESTING.md)                         | Running and writing tests                            |
| [Contributing](./CONTRIBUTING.md)               | Conventions and pull request process                 |
| [Security policy](./.github/SECURITY.md)        | Reporting a vulnerability                            |

## Before going to production

The server refuses to start in production until the configuration is safe, and two behaviours
surprise newcomers. Read [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md); the short version:

- `NODE_HOST` must be the public `https` origin and `COOKIE_SECRET` a random value of 32+ characters.
- SMTP (`MAILER_*`) is required: security codes are only ever logged in development.
- **reCAPTCHA v3 keys are required.** Without `RECAPTCHA_SECRET_KEY`, sign-up and the contact form
  are refused.
- **Every restart signs all users out.** Sessions are files that are cleared at boot, and the store
  supports a single instance.

## Using the kit for your project

Fork or clone the repository, then rename it: `APP_NAME` in `.env`, the `name` in `package.json`,
the texts in `src/translate/`, the icons in `public/`, and the theme in `src/plugins/vuetify.js`.
The repository also ships a [Claude Code](https://claude.com/claude-code) configuration (`CLAUDE.md`,
`.claude/`) describing the conventions to AI assistants; delete it if you do not use it.

## License

[MIT](./LICENSE)
