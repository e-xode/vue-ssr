# Post-deploy checks: what the release hand-off to ops carries (vue-ssr)

Chain and owner rule (2026-11-09): `e-xode.ops` `.claude/reference/release-handoff.md`. Ops stops at the server and never
reads production data structure, so the release agent says what to check and checks it after "deployed". Facts below are
read from the code; re-read them when the file named in each line changes.

## Readiness

- **Route:** `GET /healthz` (`src/api/http/readiness.js`). Ready = 200 `{"status":"ok"}`. Not ready = 503
  `{"status":"unavailable"}` (starting or shutting down), connection refused, or a restarting container. The production
  image declares a Docker `HEALTHCHECK` on the same route.
- `server.js` listens only after `mongoConnect()` succeeded; on a DB error it logs `Database connection failed` and exits 1.
  A listen error (port in use) logs `Server could not listen` and exits 1.
- `ensureIndexes` (`src/api/http/indexes.js`) never stops the boot: a failing index logs
  `Index not ensured (<collection> <key>)`. Ops greps the logs for that line; it is not visible in the readiness answer.
- A production boot without reCAPTCHA keys logs `... not set: signup and the contact form are refused` (warning, non-fatal).

## Required env vars (names only)

- **Required in production, boot throws without it:** `NODE_HOST` (public https origin, `assertProductionSiteUrl`),
  `COOKIE_SECRET` (32+ characters, not a documented placeholder, `assertProductionSecret`).
- Required to boot: `MONGO_HOST`, `MONGO_DB` (connect fails, exit 1), `MONGO_USER`/`MONGO_PWD`/`MONGO_TYPE` as the cluster
  needs.
- Required for the features to work (no boot failure): `MAILER_HOST`, `MAILER_PORT`, `MAILER_SSL`, `MAILER_LOGIN`,
  `MAILER_PASSWORD`, `MAILER_FROM` (every sign-in sends a code; the console transport never activates in production);
  `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` (signup and contact are refused without them).
- Optional: `MAILER_TO`, `RECAPTCHA_MIN_SCORE`, `APP_NAME`, `BASE`, `LOG_LEVEL`, `GA_MEASUREMENT_ID`, `FACEBOOK_APP_ID`,
  `SOCIAL_*`.
- List a new or changed variable in the hand-off, names only, flagged "required in production: boot throws without it"
  when so, with the host file; ops adds it before `deploy.sh`.

## Data side

- **Created at every boot** (`ensureIndexes`; `createIndex` is idempotent): `users {email}` unique; `blockedIps {ip}` unique;
  `logs {event}`; `logs {userId}`; `logs {createdAt:-1}` with a TTL of `LOG_RETENTION_DAYS` (90 days). An existing plain
  `logs {createdAt:-1}` index is converted to the TTL index with `collMod`.
- A new unique index can fail on existing duplicates, and a TTL deletes old documents: say so in the hand-off and check
  the `Index not ensured` log line.
- Collections are created lazily on first write. **No boot migration.** `scripts/make-admin.mjs` and
  `scripts/seed-dev-user.mjs` run by hand, never in a release; a release that needs a data step names it in the hand-off
  with who runs it.
- Sessions (`logs/sessions/`) are cleared at every production boot: every deploy signs all users out. Uploads live in
  `public/uploads/` (bind-mounted).

## Order

One container, one host: no ordering between roles. Nothing else depends on a release of this app.

## How the project agent reads production state

**No read access: the owner decides.** The dev clone's environment never points at production and the repo configures no
database tooling. Without access, verify only what the public routes prove (`/healthz`, `GET /` 200, `/sitemap.xml` 200)
and ask the owner to read the indexes (`db.<collection>.getIndexes()`) when the release changed them.
