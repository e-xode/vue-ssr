# Docker and CI/CD details

## Dockerfile (multi-stage) — `docker/build/Dockerfile`

Stage 1 (build): Node 24, `npm ci`, `npm run build`.
Stage 2 (production): copies `dist/`, `server.js`, `src/shared`, `src/api`, `src/translate`, `public`,
and `node_modules` from the builder stage, then `npm prune --production` (rather than a fresh
`npm ci --omit=dev`) to drop dev dependencies from the already-installed tree. Runs as a non-root
`node` user. The container's `CMD` is `["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]`
— supervisord, not a direct `node server.js`, owns the process.

## docker-compose.yml + docker-compose.local.yml

Split into a base file and a local override so the dev DB target switches without editing service or connection config:

- `docker-compose.yml` (base): `node` service only. Reads `.env` as-is, so by default the app connects to the **remote** MongoDB (Atlas) defined by `MONGO_HOST`/`MONGO_TYPE`.
- `docker-compose.local.yml` (override): re-adds the `mongo` service, restores `node.depends_on: mongo (service_healthy)`, and overrides `node.environment` with `MONGO_HOST=mongo` + `MONGO_TYPE=mongodb`. `environment:` wins over `env_file:`, so the Atlas values in `.env` are redirected to the local container without touching `.env`. The host-side port publish is `${MONGO_PORT:-27017}:27017` — the internal container port always stays `27017`, so `MONGO_PORT` only needs to change to avoid a host port clash when running more than one local Mongo-backed Compose stack at once.

`MONGO_USER`/`MONGO_PWD`/`MONGO_DB` stay in `.env` and serve both modes. Only host + type differ.

### Switching

Driven by the `COMPOSE_FILE` variable in `.env`:

- Local (node + mongo, default): `COMPOSE_FILE=docker-compose.yml:docker-compose.local.yml` uncommented → `docker compose up` starts both.
- Remote (Atlas): comment the `COMPOSE_FILE` line → `docker compose up` loads the base only.

Equivalent without editing `.env`: `docker compose -f docker-compose.yml -f docker-compose.local.yml up` (local) vs `docker compose -f docker-compose.yml up` (remote). The override is named `docker-compose.local.yml` (not `docker-compose.override.yml`) to avoid implicit auto-merge.

## GitHub Actions details

### npm-test (`npm-test.yml`)

- Triggers: push and PR to `master`/`development`
- Node 24, three **separate** jobs run in parallel: `lint` (`npm ci` → `lint:check`), `test`
  (`npm ci` → `test:run`), `build` (`npm ci` → `build`). Split deliberately — they used to share one
  job where `lint:check` ran first, so an ESLint/eslint-plugin-vue bump turned the job red without
  ever saying whether the tests passed. `build` is the newest of the three and the most useful for
  catching a `vite`/`vue`/`vuetify`/`sass-embedded` bump breaking the SSR bundle before release.
- `concurrency` cancels a superseded run on the same ref.

### docker-build (`docker-build.yml`)

- Triggers: tags matching `v*` (not a push to `master`)
- Builds `docker/build/Dockerfile` with buildx + GitHub Actions cache, pushes to `ghcr.io`
- Tags: semver `{{version}}`, semver `{{major}}.{{minor}}`, and `latest` — no SHA tag, which is why
  `CLAUDE.md`'s Fleet verification contract records rollback as having no direct lever

### npm-publish (`npm-publish.yml`)

- Triggers: tags matching `v*` (same trigger as `docker-build.yml` — both fire on a version tag)
- Node 24
- Steps: `npm ci` → `lint:check` → `test:run` → `build` → `npm publish --provenance --access public`
- Secret: `NPM_TOKEN`

### security (`security.yml`)

- Triggers: push and PR to `master`/`development`
- `secrets` job: `gitleaks` (free OSS image), always runs, blocking
- `deps-review` job: PR-only (`dependency-review-action@v4`, `fail-on-severity: high`) — compares two
  refs, so it only makes sense on a PR. This is the actual PR merge gate for dependency
  vulnerabilities; scoped to what the diff introduces, not the whole dependency tree.

### audit (`audit.yml`)

- Triggers: weekly cron (`0 6 * * 1`) + manual `workflow_dispatch` — never push or PR
- `npm audit --omit=dev --audit-level=high` against the current repo state
- Deliberately separate from `security.yml`: auditing the whole tree makes this workflow go red the
  moment a vulnerability is published against an already-installed dependency, with zero commits
  involved. Running that check on PRs previously marked a PR as red for fixing a vulnerability it
  didn't introduce. Never add this workflow to `required_status_checks` — it is a debt signal, not a
  merge gate.
