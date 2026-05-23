# Docker and CI/CD details

## Dockerfile (multi-stage)

Stage 1 (build): Node 24, npm ci, npm run build
Stage 2 (production): Node 24-slim, copy dist/, npm ci --omit=dev, expose port

## docker-compose.yml + docker-compose.local.yml

Split into a base file and a local override so the dev DB target switches without editing service or connection config:

- `docker-compose.yml` (base): `node` service only. Reads `.env` as-is, so by default the app connects to the **remote** MongoDB (Atlas) defined by `MONGO_HOST`/`MONGO_TYPE`.
- `docker-compose.local.yml` (override): re-adds the `mongo` service, restores `node.depends_on: mongo (service_healthy)`, and overrides `node.environment` with `MONGO_HOST=mongo` + `MONGO_TYPE=mongodb`. `environment:` wins over `env_file:`, so the Atlas values in `.env` are redirected to the local container without touching `.env`.

`MONGO_USER`/`MONGO_PWD`/`MONGO_DB` stay in `.env` and serve both modes. Only host + type differ.

### Switching

Driven by the `COMPOSE_FILE` variable in `.env`:

- Local (node + mongo, default): `COMPOSE_FILE=docker-compose.yml:docker-compose.local.yml` uncommented → `docker compose up` starts both.
- Remote (Atlas): comment the `COMPOSE_FILE` line → `docker compose up` loads the base only.

Equivalent without editing `.env`: `docker compose -f docker-compose.yml -f docker-compose.local.yml up` (local) vs `docker compose -f docker-compose.yml up` (remote). The override is named `docker-compose.local.yml` (not `docker-compose.override.yml`) to avoid implicit auto-merge.

## GitHub Actions details

### CodeQL (`codeql.yml`)

- Triggers: push to master/development, PRs, weekly cron
- Language: javascript-typescript
- Steps: checkout → init CodeQL → autobuild → analyze

### npm-publish (`npm-publish.yml`)

- Triggers: tags matching `v*`
- Node 24
- Steps: npm ci → lint:check → test:run → build → npm publish (provenance, public)
- Secret: NPM_TOKEN

### npm-test (`npm-test.yml`)

- Triggers: push master/development, PRs
- Node 20
- Steps: npm ci → lint → test:run

### docker-build (`docker-build.yml`)

- Triggers: push to master
- Builds and pushes to ghcr.io
- Tags: SHA commit + "latest"
- Uses buildx with GitHub Actions cache
