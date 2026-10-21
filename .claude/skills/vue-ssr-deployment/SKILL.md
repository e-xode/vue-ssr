---
name: vue-ssr-deployment
description: "Deployment and CI/CD reference for the Vue SSR Starter Kit: Docker builds, the docker-compose local-vs-remote DB switch, GitHub Actions workflows, production configuration, and Dependabot updates. Trigger on any deployment, Docker, docker-compose local-vs-remote DB switch, CI/CD, production config, or infrastructure question. Don't use for: app architecture (→ vue-ssr-architecture), auth flow (→ vue-ssr-auth), post-task validation (→ vue-ssr-validation), sitemap/robots (→ seo), the actual production rollout procedure (private, → e-xode.scripts)."
---

# Vue SSR Deployment

> Owns Docker, CI/CD pipelines, production configuration, and infrastructure.

## Division of responsibilities

| Concern | Skill |
| --- | --- |
| File structure, SSR lifecycle, locale routing, new view/feature scaffolding | vue-ssr-architecture |
| Which endpoints need auth protection, and the auth-domain logic itself | vue-ssr-auth |
| Build/bundle/production deployment config | vue-ssr-deployment |
| post-task validation | vue-ssr-validation |

## Docker

- **Dockerfile**: `docker/build/Dockerfile` — multi-stage build (build → production). There is no
  root-level `Dockerfile`.
- **docker-compose.yml** (base): dev env, runs the `node` app only and reads `.env` → connects to a **remote** MongoDB (e.g. Atlas) via `MONGO_HOST`/`MONGO_TYPE`
- **docker-compose.local.yml** (override): adds a local `mongo` container and redirects the app to it (`MONGO_HOST=mongo`, `MONGO_TYPE=mongodb`, overriding `.env`)
- **Switch local ↔ remote**: via the `COMPOSE_FILE` variable in `.env` (set in `.env.example`). Uncommented = local (node + mongo); commented = remote. See `references/docker-ci.md`

## GitHub Actions (6 workflows)

| Workflow           | Trigger                              | Purpose                                                       |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `npm-test.yml`      | Push/PR to `master`/`development`     | 4 **parallel, separate** jobs: `format`, `lint`, `test`, `build` — kept apart so a lint bump doesn't hide a test result; markdown, `docs/` and `.claude/` changes skip it |
| `docker-build.yml`  | Tags `v*`                             | Builds and pushes to GHCR, tagged semver + short SHA + `latest` |
| `npm-publish.yml`   | Tags `v*`                             | `npm ci` → `lint:check` → `test:run` → `build` → `npm publish`  |
| `security.yml`      | Push/PR to `master`/`development`     | `secrets` job (gitleaks, always); `deps-review` job (PR-only, fails on new high-severity advisories) — this is the PR gate |
| `audit.yml`         | Weekly cron + manual dispatch          | `npm audit --omit=dev --audit-level=high` against repo state — a debt signal, **never** a merge gate (can go red with zero new commits) |
| `quality.yml`       | Weekly cron + manual dispatch          | Report-only scans (osv-scanner, `npm audit signatures`, semgrep, trivy, hadolint, actionlint, zizmor) written to the job summary — never a merge gate |

Actions are pinned to commit SHAs (Dependabot's `github-actions` ecosystem keeps them current). `docker-build` and `npm-publish` share a `release-<ref>` concurrency group that never cancels a running release.

A tag push (`v1.2.3`) fires `docker-build` and `npm-publish` simultaneously — releasing a version
publishes to both GHCR and npm in the same action.

## Production requirements

- `COOKIE_SECRET`: Must be set (server refuses to start if missing)
- `NODE_HOST`: Must be the public https origin (server refuses to start on a missing, `http` or localhost value; the Dockerfile default is a placeholder to override)
- `RECAPTCHA_SECRET_KEY`: Must be set, reCAPTCHA verification fails closed in production
- Helmet CSP: active everywhere; production `script-src` has no `'unsafe-inline'`, dev relaxes it for HMR
- Sessions: stored under `logs/sessions/` (a bind-mounted directory), cleared at every boot; absolute lifetime 30 days
- Uploads (avatars): `public/uploads/` is served by Express at `/uploads` in production (bind-mounted directory)
- `LOG_LEVEL` (`error|warn|info|debug`, default `info`) controls log verbosity
- Error stack traces: Hidden in production responses

## Health and graceful shutdown

`GET /healthz` returns 200 `{"status":"ok"}` once the server listens and 503 `{"status":"unavailable"}` while booting or shutting down (`Cache-Control: no-store`). Use it as the readiness probe.

On SIGTERM and SIGINT (`src/api/http/shutdown.js`):

1. `/healthz` flips to 503
2. Stops accepting new connections
3. Closes MongoDB connection (`mongoClose`)
4. Exits 0 (exits 1 on error or after a 10 s timeout)

## Dependabot

Weekly updates (`dependabot.yml`): npm (increasing version strategy), GitHub Actions and the Docker base image.

## SEO artifacts

The dynamic `robots.txt`/`sitemap.xml` served by `src/api/http/seo.js` are owned by the `seo` skill — see there, not here.

## Production rollout (external)

Production deployment of this application happens **outside this repository**, via a private internal Ops tooling repo (`e-xode.scripts`) shared across a fleet of related projects — this repo owns build + CI/CD only. **A tag or a merge to master does not deploy by itself.** The rollout is a pull-based Docker pattern: fetch the versioned registry image, recreate the container with server-side runtime configuration and mounted directories, and verify a health check before declaring success. No hostnames, ports, credentials, paths, or other infrastructure facts are — or will ever be — documented in this public repository; they are single-sourced privately. ➜ See repo: e-xode.scripts — production rollout (private, not in this repo).
