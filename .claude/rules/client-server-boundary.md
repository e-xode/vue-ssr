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

Client-rendered and SSR-hydrated code must NOT import server-only modules. A leaked server import breaks the client bundle — the `build` step in the hooks battery will fail.

**Never import from:**

- `mongodb`, `express`, `express-session`, `nodemailer` (server packages)
- `node:*` built-ins (`node:fs`, `node:path`, `node:crypto`) or legacy `fs`/`path`
- Server-only shared modules: `src/shared/mongo.js`, `src/shared/dbHelpers.js`, `src/shared/email.js`, `src/shared/security.js`

**Isomorphic shared modules are safe on both sides:** `src/shared/api.js` (`apiFetch`), `src/shared/utils.js`, `src/shared/const.js`, `src/shared/theme.js`.

**To use server data in client code:**

- Call API routes (`src/api/**`) through `apiFetch` from `src/shared/api.js`
- Read Pinia stores hydrated during SSR
- Pass data via route meta or the SSR initial state

Full architecture: see skill `vue-ssr-architecture`.
