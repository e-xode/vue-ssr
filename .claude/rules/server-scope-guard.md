---
paths:
  - 'server.js'
  - 'src/api/**'
---

# Server scope guard

`server.js` and everything under `src/api/` is server-only. It runs in Node.js, never in the browser.

**Constraints:**

- Never import Vue, Vuetify, Pinia, vue-router, or vue-i18n here.
- Never reference `window`, `document`, `localStorage`, or other browser APIs.
- Use `src/shared/mongo.js` for MongoDB access (singleton client: `mongoConnect` / `mongoClose`).
- Validate every ObjectId with `parseObjectId()` from `src/shared/dbHelpers.js` before a query.
- Use `src/shared/log.js` (`logInfo` / `logWarn`) for structured server logging.
- Route handlers are `async`/`await` wrapped in try/catch — see rule `api-error-handling` (do not duplicate that pattern here).

**Delegation:** the orchestrator delegates changes here to the `server` agent.

Full patterns: see skills `vue-ssr-server`, `vue-ssr-architecture`.
