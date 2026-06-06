# Positioning — Vue SSR Starter Kit

The durable record of who the kit is for and why they choose it. Facts come from `marketing-content`;
this file holds the strategic interpretation.

## One-line positioning

A production-grade Vue 3 SSR starter kit with authentication, i18n, admin, and a curated Claude Code
configuration baked in: AI-pair-programming-ready foundation, not a bare boilerplate.

## Value proposition

- **Skip the plumbing** — SSR (Vite), auth (email + security-code, bcrypt, sessions), i18n, admin, and
  a MongoDB backend wired and working out of the box.
- **Production-grade defaults** — Helmet CSP, per-endpoint rate limiting, Vitest suite, Docker
  multi-stage build, GitHub Actions CI (npm-test, npm-publish, docker-build to GHCR).
- **AI-ready out of the box** — a curated Claude Code multi-agent fleet, skill library, path-scoped
  rules, and a post-task validation hooks battery ship with the repo. This is the standout differentiator.
- **Free and open** — MIT-licensed, published to npm and GitHub; clone, read, and learn from real code.

## ICP and segments

| Segment | Who | Primary job-to-be-done | Lead angle |
| --- | --- | --- | --- |
| Solo developers / indie hackers | Builders shipping a side project or MVP | Start fast on a solid base, avoid boilerplate fatigue | Time saved, batteries included, MIT |
| Dev teams / agencies | Teams needing a production base | Standardize a stack, ship client work faster | Production defaults, CI/Docker, admin panel |
| Vue developers | Devs researching SSR patterns | Learn a real Vue 3 SSR + Express architecture | Readable reference implementation, locale routing |
| Technical leads | Leads evaluating a starting point | De-risk the stack choice, judge code quality | AI-ready config, security defaults, test suite |

Primary ICP for adoption (and the services funnel): **dev teams / agencies** (production base + the
AI-ready config is the strongest pull) and **Vue developers** (the kit as a reference implementation).

## Differentiation

- **AI-pair-programming-ready** — the curated Claude Code fleet/skills/rules/hooks ship with the kit,
  versus a plain boilerplate that leaves AI tooling to the user.
- **Production-grade, not a toy** — security, CI, Docker, tests included, versus a starter that stops at
  "hello world".
- **Free and readable** — MIT, full source on GitHub, versus paid or closed templates.

See `competitive.md` for the competitor map.

## Decision log

- (seed) Initial positioning captured from `marketing-content` + `package.json`. Revisit when the stack,
  the differentiator (Claude config fleet), or the primary ICP changes.
