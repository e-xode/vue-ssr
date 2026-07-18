# CLAUDE.md — Vue SSR Starter Kit

> Vue 3 + Express SSR starter kit with authentication, i18n, Vuetify 4, admin panel, and MongoDB. Hard rules only — project knowledge lives in skills (`.claude/skills/`).

---

## 🚨 Task completion protocol

After completing ANY task that changes the project, before responding:

1. Run: `git diff --name-only HEAD && git diff --name-only --cached && git ls-files --others --exclude-standard`
2. **Changelog** — for changelog-worthy changes (feature, bug fix, behavior/UI/i18n, or **product** dependency change), silently add a curated entry under `## [Unreleased]` in `CHANGELOG.md` per `vue-ssr-release`. Skip by purpose, not path: `.claude/` config incl. its deps, reformatting, lockfile-only, test-only, internal-docs. Never bump version or commit.
3. **Validation is opt-in** — if any `.vue`/`.js`/`.scss`/`.css` changed, do NOT validate automatically. Ask the user, wait, and delegate to `hooks` ONLY on their yes or an explicit request this turn — never otherwise.
4. When validation runs and fails → fix it yourself, re-delegate, repeat until all-pass.

**Never ask about the changelog** — add it silently; only validation is gated (step 3).

---

## Hard rules

**No auto-commit** — Never `git commit`/`push`/`tag`/`rebase`/`reset --hard` unless user explicitly requests it this turn. Commit format: `[$branch] content`. Always append: `Co-authored-by: AI Assistant <ai-assistant@users.noreply.github.com>`. **Exception: "release"** — full release process (CHANGELOG, version bump, commit, push, tag).

**No code comments** — No `//`/`/* */`/`<!--` in `.vue/.js/.scss/.css`. Exception: empty catch blocks need `console.error(err)`.

**SCSS externalized** — Every Vue component with styles has its own `.scss` file referenced via `<style lang="scss" scoped src="./ComponentName.scss"></style>`.

**i18n mandatory** — All user-visible text via `t('key')`. No hardcoded strings in templates.

**SCSS variables** — No hardcoded colors, spacings, or font sizes. Use `styles/variables.scss`.

**Composition API only** — No Options API. Always `<script setup>`.

**Shared factorization** — Reusable logic in `src/shared/`. Never duplicate code.

**ObjectId validation** — Always `parseObjectId()` from `dbHelpers.js` before MongoDB queries.

**catch blocks** — Always `console.error(err)`. Never empty catch.

**No over-engineering** — Keep it simple. YAGNI.

---

## Path-scoped rules

At session start, read and apply all files in `.claude/rules/`. Each rule declares a `paths:` frontmatter — enforce its constraints whenever you touch a matching file.

---

## Agents directory

10-agent fleet. Orchestrator never validates itself — it delegates to `hooks` only on the user's opt-in.

| Agent       | Trigger (delegate when…)                                                                      |
| ----------- | --------------------------------------------------------------------------------------------- |
| `hooks`     | Post-task validation only (format → lint → build → test battery)                              |
| `review`    | User asks to review a branch / PR / diff — read-only, structured report                       |
| `translate` | Adding/editing/deleting i18n keys, locale parity audits, bulk i18n work                       |
| `vue`       | Vue component creation, composables, Pinia stores, routing, unit tests                        |
| `server`    | server.js / `src/api/**` / server-only `src/shared/**`: Express routes, MongoDB, sessions     |
| `design`    | UI/UX design, SCSS styling, Vuetify theming, visual quality, accessibility, responsive layout |
| `content`   | Marketing/editorial content: LinkedIn, page copy, README, advisory |
| `marketing` | Marketing strategy: positioning, monetization stance, campaigns, channels, growth |
| `visual-qa` | Screenshots changed views; reports defects vs brand charter (read-only) |
| `release`   | User says "release" — version bump, CHANGELOG, branch, commit/push/tag proposal               |

---

## Sub-agent orchestration

1. **Validation is centralized and opt-in** — NEVER run `npm test/lint/format/validate` yourself. Only the **`hooks` agent** validates, and only when the user opts in per the Task completion protocol (workaround for Copilot bug — see `vue-ssr-hooks` skill). No other agent may run validation.
2. **Sub-agent contract** — Scoped work → no validation → no comments → structured summary (what/files/blockers) → stay in scope.
3. **Reuse before writing** — Search `src/shared/`, `src/composables/`, existing modules before adding utility code. Key shared: `apiFetch`, `parseObjectId`, `parsePagination`, `findUserSafe`, `generateSecurityCode`, `escapeHtml`.
4. **Delegation routing** — Vue component/store/composable/test work → `vue` agent. Express routes / MongoDB / sessions / server-only shared (`server.js`, `src/api/**`) → `server` agent. i18n key operations → `translate` agent (fleet mode by default). UI/UX design, styling, Vuetify theming, responsive layout → `design` agent. Content → `content` agent. Marketing strategy (positioning, campaigns, channels) → `marketing` agent. Visual QA of changed views → `visual-qa` agent. Review → `review` agent. Release → `release` agent. Multiple agents can work in parallel on independent scopes.

---

## Commands

```bash
npm run dev          # Dev server (SSR + HMR)
npm run build        # Build client + server bundles
npm run prod         # Production mode (requires build first)
npm run test:run     # Vitest single run
npm run lint         # ESLint fix
npm run lint:check   # ESLint check only
```

---

## Meta

This file loads every turn. Budget: ≤ 10 KB / ~2500 tokens. Knowledge → skills. Rules → here. See `skill-creator` for governance details.

---

## Skills index

Skills load on demand by description match.

| Skill                     | Triggers on                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `vue-ssr-architecture`    | App architecture, file structure, routing, SSR lifecycle, shared utils, env vars |
| `vue-ssr-auth`            | Auth flow, security codes, sessions, rate limiting, captcha                                               |
| `vue-ssr-deployment`      | Docker, GitHub Actions CI/CD, production config, graceful shutdown                                        |
| `vue-ssr-server`          | Express 5 API routes, middleware guards, MongoDB access, rate limiters |
| `vue-ssr-hooks`           | Post-task validation, hook scripts, format/lint/build/test battery                                        |
| `claude-anthropic`        | Claude config rules + audit; Anthropic doctrine. Co-load with skill-creator                               |
| `skill-creator`           | Authoring/editing skills (workflow, eval, iterate)                                                        |
| `starter-kit-adapt`       | Post-fork/clone adaptation, customizing Claude config for new project                                     |
| `translate`               | i18n, translations, locale keys, vue-i18n usage, locale parity                                            |
| `vue3-composition`        | Vue 3 Composition API, reactivity, composables, lifecycle, watchers |
| `vue3-components`         | Vue 3 components: props, events, slots, provide/inject, dynamic/async |
| `vue3-templates`          | Vue 3 template syntax: directives, list/conditional rendering, bindings, native v-model                   |
| `vue3-builtin-components` | Vue 3 built-ins: Teleport, Suspense, KeepAlive, Transition, TransitionGroup                               |
| `vue3-reusability`        | Vue 3 custom directives and plugins (composables → vue3-composition)                                      |
| `vue3-performance`        | Vue 3 perf: shallowRef/markRaw, v-memo/v-once, async components, SSR perf                                 |
| `design-ux`               | UI quality, visual hierarchy, accessibility, responsive UX, micro-interactions |
| `design-scss`             | SCSS design system: tokens, mixins, animations, utilities, component-scoped patterns                      |
| `vue-ssr-design`          | Design delegation routing, mixed-task splitting, starter-kit design philosophy |
| `brand-art-direction` | MD3 visual charter (visual-qa rubric): rhythm, hovers, palette roles |
| `vuetify-overview`        | Vuetify 4 component selection, project defaults, palette, SSR setup, breakpoints |
| `vuetify-theming`         | Vuetify 4 theme config, light/dark mode, defaults provider, CSS utility classes                          |
| `vuetify-layout`          | Vuetify 4 app shell, grid, app-bar, drawer, menus, tabs, breadcrumbs |
| `vuetify-forms`           | Vuetify 4 form inputs, v-form validation rules, async submit, input defaults                              |
| `vuetify-data`            | Vuetify 4 data tables (v-data-table-server), server-side pagination, v-pagination                        |
| `vuetify-components`      | Vuetify 4 display/feedback: cards, lists, chips, dialogs, snackbars, alerts, progress |
| `vuetify-icons`           | Vuetify 4 @mdi/js tree-shakeable SVG icons, icon props, catalog                                          |
| `frontend-design`         | Greenfield/standalone distinctive UI (non-kit); in-kit UI → design agent |
| `marketing-content` | Facts for marketing the kit: stack, features, differentiator, assets |
| `content-strategy` | Editorial method: tone/voice, channel playbooks, personas, growth advisory |
| `marketing-strategy` | Marketing strategy: positioning, monetization stance, campaigns, channels, competitive |
| `seo` | Kit SEO: entry-server meta, JSON-LD, hreflang, sitemap/robots |
| `review`                  | Code review of branch / PR / diff                                                                         |
| `vue-ssr-release`         | Release workflow, version bump, CHANGELOG generation, release branch                                      |
