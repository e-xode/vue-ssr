---
name: marketing-content
description: "Marketing and product-knowledge FACTS for the Vue SSR Starter Kit (e-xode/vue-ssr): the source of truth for acquisition content that markets the open-source kit itself. Covers the canonical content rules (bilingual FR+EN, humble tone, concrete numbers, never the → arrow character), where assets live (src/assets/linkedin/, page copy via i18n, the GitHub/npm storefront), and product facts: what the kit is (Vue 3.5 + Vite + Express 5 + MongoDB 7 + Vuetify 4 SSR boilerplate with auth, i18n, admin), its stack/version snapshot (authoritative source = package.json), feature inventory, and differentiator (a curated Claude Code agent/skill fleet). Trigger when you need the facts behind acquisition content: what the kit is, its features, stack, positioning, audience, license, repo/npm location, or asset locations. Don't use for: the editorial method, tone/voice, inventory/backlog and writing workflow (→ content-strategy), i18n keys (→ translate), page meta/structured data (→ seo), visual/layout design (→ design)."
---

# Marketing content — Vue SSR Starter Kit

> The product being marketed **is the kit itself**: `@e-xode/vue-ssr`, an open-source Vue 3 SSR starter kit published to npm and GitHub by E-XODE. Acquisition here means developer adoption — GitHub stars, npm installs, forks, and inbound interest in E-XODE's services. Treat this context on every acquisition-related task.

## Division of responsibilities

This skill owns the **facts**. The editorial **method** (how to research, write, and optimize) lives in the `content-strategy` skill, executed by the `content` agent.

| Concern                                                                       | Where                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------- |
| What the kit is, its stack, features, differentiator, license, asset locations | `marketing-content` (here)                         |
| Editorial workflow, tone/voice, channel templates, personas, inventory, backlog | `content-strategy`                               |
| Inventory of everything published (glossary)                                  | `content-strategy/references/content-inventory.md` |
| Strategy, monetization stance, campaigns, channel mix, positioning, competitive | `marketing-strategy`                            |

➜ See skill: content-strategy — the writing method that consumes these facts.
➜ See skill: marketing-strategy — the strategy layer that decides what content to produce and why.

## Content rules (mandatory)

1. **Bilingual** — every piece of marketing content is produced in **French and English**, each reading natively.
2. **Tone** — professional, authentic, simple, humble. No empty buzzwords, no aggressive sales pitch. Peer-to-developer voice.
3. **Never use the `→` arrow character** in produced content. Prefer bullet lists, short sentences, or dashes. (The arrow is fine inside `.claude/` config like this file, never in a published post/article/page copy.)
4. **Concrete numbers** — back claims with real, verifiable figures (dependency versions, test count, number of locales, etc.). Never invent metrics. The authoritative source for versions is `package.json`; re-read it rather than trusting a snapshot.
5. **Asset locations** — produced LinkedIn assets under `src/assets/linkedin/`; page copy becomes i18n keys via the `translate` agent. Keep `.claude/` English-only.
6. **Document** each new piece in `content-strategy/references/content-inventory.md` and in `CHANGELOG.md`.

## What the kit is

`@e-xode/vue-ssr` — "Vue 3 SSR Starter Kit with Authentication". An open-source, production-grade boilerplate for building server-rendered Vue 3 applications with authentication, i18n, an admin panel, and a MongoDB backend, out of the box.

- **License:** MIT.
- **Repository:** `https://github.com/e-xode/vue-ssr`.
- **npm:** `@e-xode/vue-ssr`.
- **npm keywords:** vue, ssr, starter-kit, boilerplate, authentication.
- **Maintainer:** E-XODE (Christophe Bragard).
- Do NOT invent a live demo URL or download counts — if a real one exists, confirm it before using it.

## Stack (snapshot — `package.json` is authoritative)

Vue 3.5+, Vite, Express 5, MongoDB 7 driver, Vuetify 4 (Material Design 3), Pinia, Vue Router 5, Vue i18n 11, Node >= 24. Build tooling: ESLint + Prettier, Vitest. Always re-read `package.json` for exact current versions before quoting them in content.

## Feature inventory (what to sell)

- **Server-Side Rendering** with Vite, SEO-friendly (`entry-server.js` meta injection, dynamic `sitemap.xml` + `robots.txt`, hreflang). ➜ See skill: seo.
- **Authentication** — email/password signup + signin with email **security-code verification**, bcrypt hashing, session destruction. ➜ See skill: vue-ssr-auth.
- **Security** — Helmet CSP, SHA-256 codes, `timingSafeEqual`, per-endpoint rate limiting, file-based sessions.
- **Internationalization** — EN + FR, locale-prefixed routing (`/:locale/`).
- **Admin panel** — user management, activity logs, IP security.
- **Contact form** with rate limiting.
- **Design system** — Vuetify 4 MD3 components + an SCSS token/mixin system.
- **Testing** — Vitest with a unit-test suite (re-read the suite for the current count).
- **Deployment** — Docker multi-stage build, GitHub Actions CI (npm-publish on tags, npm-test on PR, docker-build to GHCR). ➜ See skill: vue-ssr-deployment.

## Differentiator (the standout angle)

The kit ships a **curated Claude Code configuration**: a multi-agent fleet (`design`, `vue`, `server`, `translate`, `review`, `hooks`, `release`, `content`, `visual-qa`), an extensive on-demand skill library, path-scoped rules, and a post-task validation hooks battery. This makes it not just a code boilerplate but an **AI-pair-programming-ready** foundation — a genuinely differentiating, concrete story for the developer audience.

## Audience

Solo developers and indie hackers, dev teams and agencies needing a production base, Vue developers researching SSR patterns, and technical leads evaluating a starting point. ➜ See skill: content-strategy → `references/audience-messaging.md` for the angle per persona.

## Where content lives

```
src/assets/linkedin/
├── articles/      # long-form articles, FR+EN .md pairs (+ optional .html render)
└── posts/         # short LinkedIn posts, FR+EN .md pairs
```

Page marketing copy (landing/contact) is i18n, placed via the `translate` agent in `src/translate/{en,fr}.json`. The repo `README.md` and the npm description are the kit's primary "storefront" copy. If marketing assets should not ship in the published npm package, exclude `src/assets/linkedin/` via the package `files` field or `.npmignore`.

## Workflow for a new content piece

1. Confirm the audience and goal (adoption, credibility, feature announcement).
2. Draft in French and English, applying the tone rules and the `→`-free constraint.
3. Save both versions under `src/assets/linkedin/` (articles/ or posts/), or route page copy to the `translate` agent.
4. Add an inventory row in `content-strategy/references/content-inventory.md` and a `CHANGELOG.md` entry under `## [Unreleased]`.
