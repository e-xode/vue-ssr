# Signing in on the dev app as an agent (decision 2026-11-07)

An agent tests the app on its **dev** environment without the owner signing in by hand and without typing a password or an
e-mail code. Secure, autonomous, **dev only**. Short copy of the fleet canonical text (`e-xode.ops`
`.claude/reference/dev-login.md`).

**This repo is the starter kit: a new app created from it copies this pattern** (route, helper, unit tests, `.env.example`
lines, seed script) onto its own session helper and user collection, then follows the checklist below.

## How an agent signs in (dev server, user `christophe`)

```bash
~/workspace/e-xode.ops/infra/dev-session.e-xode.dev.sh vue-ssr     # writes ~/.dev-sessions/vue-ssr.json (0600)
```

It prints the file path and `HTTP 200`, never a secret. Load it in Playwright:
`browser.newContext({ storageState: process.env.HOME + "/.dev-sessions/vue-ssr.json" })`. It is a normal cookie session
of the fixed QA user (`qa@e-xode.net`) and expires like any session: run the script again. Dev URL:
`https://vue-ssr.dev.e-xode.net` (tailnet only). Who am I: `GET /api/auth/me` (`src/api/auth/me.js`).

## What exists in the app

- `POST /api/dev/login` (`src/api/dev/login.js`, wired in `src/api/router.js`), mounted only when **all three** hold:
  `NODE_ENV` is not `production`, `DEV_LOGIN_ENABLED=true`, `DEV_LOGIN_TOKEN` is a string of 32+ chars.
- Header `x-dev-login-token` (constant-time compare); a wrong or missing token answers **404**.
- Signs in **only** `DEV_LOGIN_EMAIL` (default `qa@e-xode.net`), never an e-mail taken from the request.
- The QA user is created idempotently in the Atlas `dev-vue-ssr` database by `scripts/seed-dev-user.mjs`
  (`docker exec e-xode-vue-ssr node scripts/seed-dev-user.mjs`).
- The token lives in the dev `.env` of the clone (0600, gitignored). Never print, commit or paste it.

## Rules that do not bend

- **Dev only.** Never set `DEV_LOGIN_*` on a production host; a unit test asserts the route is off under `production`.
- A dev app uses its own Atlas `dev-<app>` database, never a local Mongo on the dev server.
- The agent never types a password, a code or a token into a form; it loads the file the script wrote.
- Real accounts are never used by agents. If the QA user needs more (a plan, data), ask the owner.

## Adding it to a new app (checklist)

1. Copy the route, helper, unit tests and `.env.example` lines of this repo onto the app's session helper and user collection.
2. Add `scripts/seed-dev-user.mjs` (idempotent, lowest normal role, no password).
3. Dev `.env`: `DEV_LOGIN_ENABLED=true`, `DEV_LOGIN_TOKEN=$(openssl rand -hex 32)` (file stays 0600).
4. `docker compose up -d` (plain, no override), check the container env points at `mongodb+srv` + `dev-<app>`, seed the
   QA user, run the session script, check the who-am-I endpoint with the saved cookie.

## Troubleshooting

`HTTP 404` from the script: route off (`DEV_LOGIN_ENABLED` unset, `NODE_ENV=production`, token under 32 chars) or wrong
token; recreate the container after any `.env` change. `HTTP 404` with the right token: QA user not seeded.
The script refuses to run anywhere but the dev server.
