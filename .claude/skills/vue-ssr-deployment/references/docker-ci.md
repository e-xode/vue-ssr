# Docker and CI/CD details

## Dockerfile (multi-stage)

Stage 1 (build): Node 24, npm ci, npm run build
Stage 2 (production): Node 24-slim, copy dist/, npm ci --omit=dev, expose port

## docker-compose.yml

Services:
- `app`: Node app with volume mounts, depends_on mongo
- `mongo`: MongoDB 7, persistent volume, port 27017

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
