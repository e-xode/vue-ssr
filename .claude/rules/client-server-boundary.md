---
paths:
  - 'src/**/*.vue'
  - 'src/stores/**'
  - 'src/composables/**'
  - 'src/components/**'
  - 'src/views/**'
  - 'src/router.js'
  - 'src/main.js'
  - 'src/entry-*.js'
  - 'src/plugins/**'
---

# Client/server boundary

Client-rendered and SSR-hydrated code must NOT import server-only modules. A leaked server import breaks the client bundle — the `build` stage of `npm run validate` will fail.

**Never import from:**

- `mongodb`, `express`, `express-session`, `nodemailer` (server packages)
- `node:*` built-ins (`node:fs`, `node:path`, `node:crypto`) or legacy `fs`/`path`
- Server-only shared modules: `src/shared/mongo.js`, `src/shared/dbHelpers.js`, `src/shared/email.js`, `src/shared/security.js`, `src/shared/captcha.js` (server-side reCAPTCHA verification against `RECAPTCHA_SECRET_KEY` — the client-side counterpart is `composables/useCaptcha.js`, a different file), `src/shared/logger.js` (`logEvent(db, ...)` — takes a MongoDB handle)

**Isomorphic shared modules are safe on both sides:** `src/shared/api.js` (`apiFetch`), `src/shared/utils.js`, `src/shared/const.js`, `src/shared/theme.js`, `src/shared/analytics.js` (guards every call with `typeof window !== 'undefined'`), `src/shared/log.js` (plain `console.*` wrappers, no Node APIs).

Full architecture: see skill `vue-ssr-architecture`.
