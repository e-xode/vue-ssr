---
name: vue-ssr-deployment
description: "Deployment and CI/CD reference for the Vue SSR Starter Kit: Docker builds, the docker-compose local-vs-remote DB switch, GitHub Actions workflows, production configuration, and Dependabot updates. Trigger on any deployment, Docker, docker-compose local-vs-remote DB switch, CI/CD, production config, or infrastructure question. Don't use for: app architecture (→ vue-ssr-architecture), auth flow (→ vue-ssr-auth), post-task validation (→ vue-ssr-validation), sitemap/robots (→ seo), the actual production rollout procedure (private, → e-xode.scripts)."
---

# Vue SSR Deployment

> Owns Docker, CI/CD pipelines, production configuration, and infrastructure.

## Docker

- **Dockerfile**: Multi-stage build (build → production)
- **docker-compose.yml** (base): dev env, runs the `node` app only and reads `.env` → connects to a **remote** MongoDB (e.g. Atlas) via `MONGO_HOST`/`MONGO_TYPE`
- **docker-compose.local.yml** (override): adds a local `mongo` container and redirects the app to it (`MONGO_HOST=mongo`, `MONGO_TYPE=mongodb`, overriding `.env`)
- **Switch local ↔ remote**: via the `COMPOSE_FILE` variable in `.env` (set in `.env.example`). Uncommented = local (node + mongo); commented = remote. See `references/docker-ci.md`

## GitHub Actions (3 workflows)

| Workflow           | Trigger                     | Steps                                    |
| ------------------ | --------------------------- | ---------------------------------------- |
| `npm-publish.yml`  | Tags `v*`                   | ci → lint → test → build → npm publish   |
| `npm-test.yml`     | Push master/dev, PR         | ci → lint → test                         |
| `docker-build.yml` | Push master                 | Build + push to GHCR (SHA + latest tags) |

## Production requirements

- `COOKIE_SECRET`: Must be set (server refuses to start if missing)
- Helmet CSP: Production-conditional (disabled in dev for HMR)
- Error stack traces: Hidden in production responses

## Graceful shutdown

Server listens to SIGTERM and SIGINT:

1. Stops accepting new connections
2. Closes MongoDB connection (`mongoClose`)
3. Exits process cleanly

Ensures zero data loss during Docker stop / rolling updates.

## Dependabot

Weekly npm updates (`dependabot.yml`): increasing version strategy.

## SEO artifacts

The dynamic `robots.txt`/`sitemap.xml` served by `server.js` are owned by the `seo` skill — see there, not here.

## Production rollout (external)

Production deployment of this application happens **outside this repository**, via a private internal Ops tooling repo (`e-xode.scripts`) shared across a fleet of related projects — this repo owns build + CI/CD only. **A tag or a merge to master does not deploy by itself.** The rollout is a pull-based Docker pattern: fetch the versioned registry image, recreate the container with server-side runtime configuration and mounted directories, and verify a health check before declaring success. No hostnames, ports, credentials, paths, or other infrastructure facts are — or will ever be — documented in this public repository; they are single-sourced privately. ➜ See repo: e-xode.scripts — production rollout (private, not in this repo).
