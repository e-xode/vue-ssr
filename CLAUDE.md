# CLAUDE.md — Vue SSR Starter Kit

> Vue 3 + Express SSR starter kit with authentication, i18n, Vuetify 4, admin panel, and MongoDB. Hard rules only — project knowledge lives in skills (`.claude/skills/`).

---

## 🚨 Task completion protocol

After completing ANY task that modifies the project, before responding to the user:

1. Run: `git diff --name-only HEAD && git diff --name-only --cached && git ls-files --others --exclude-standard`
2. If any `.vue`/`.js`/`.scss`/`.css` appear → **delegate to the `hooks` agent** with the dirty-list as input. Wait for its result.
3. If `hooks` reports failure → fix the errors yourself, then re-delegate to `hooks`. Repeat until clean.
4. ⛔ Task is NOT done until `hooks` reports all-pass. No exceptions.
5. **Changelog** — if the task produced changelog-worthy changes (user-facing feature, bug fix, dependency change, behavior/UI/i18n change), append a curated entry under `## [Unreleased]` in `CHANGELOG.md` per the `vue-ssr-release` skill. Skip pure reformatting, lockfile-only, `.claude/` config, test-only, or internal-docs changes. Run after `hooks` passes. Never bump version, never commit.

**Never ask** — Do NOT ask the user whether to run validation or update the changelog, do NOT request permission. Just do it silently.

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

6-agent fleet. Orchestrator never validates itself — always delegates to `hooks` at task end.

| Agent       | Trigger (delegate when…)                                                                      |
| ----------- | --------------------------------------------------------------------------------------------- |
| `hooks`     | Post-task validation only (format → lint → test battery)                                      |
| `review`    | User asks to review a branch / PR / diff — read-only, structured report                       |
| `translate` | Adding/editing/deleting i18n keys, locale parity audits, bulk i18n work                       |
| `vue`       | Vue component creation, composables, Pinia stores, routing, unit tests                        |
| `design`    | UI/UX design, SCSS styling, Vuetify theming, visual quality, accessibility, responsive layout |
| `release`   | User says "release" — version bump, CHANGELOG, branch, commit/push/tag proposal               |

---

## Sub-agent orchestration

1. **Validation is centralized** — NEVER run `npm test/lint/format` yourself. Only the **`hooks` agent** validates (workaround for Copilot bug — see `vue-ssr-hooks` skill). No other agent may run validation.
2. **Sub-agent contract** — Scoped work → no validation → no comments → structured summary (what/files/blockers) → stay in scope.
3. **Reuse before writing** — Search `src/shared/`, `src/composables/`, existing modules before adding utility code. Key shared: `apiFetch`, `parseObjectId`, `parsePagination`, `findUserSafe`, `generateSecurityCode`, `escapeHtml`.
4. **Delegation routing** — Vue component/store/composable/test work → `vue` agent. i18n key operations → `translate` agent (fleet mode by default). UI/UX design, styling, Vuetify theming, responsive layout → `design` agent. Review → `review` agent. Release → `release` agent. Multiple agents can work in parallel on independent scopes.

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

Skills load on demand by description matching. This index aids discovery.

| Skill                     | Triggers on                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `vue-ssr-architecture`    | App architecture, file structure, routing, SSR lifecycle, shared utils, Vuetify, env vars                |
| `vue-ssr-auth`            | Auth flow, security codes, sessions, rate limiting, captcha                                              |
| `vue-ssr-deployment`      | Docker, GitHub Actions CI/CD, production config, graceful shutdown                                       |
| `vue-ssr-hooks`           | Post-task validation, hook scripts, format/lint/test battery                                             |
| `claude-anthropic`        | Claude config rules + audit; Anthropic doctrine. Co-load with skill-creator                              |
| `skill-creator`           | Authoring/editing skills (workflow, eval, iterate)                                                       |
| `starter-kit-adapt`       | Post-fork/clone adaptation, customizing Claude config for new project                                    |
| `translate`               | i18n, translations, locale keys, vue-i18n usage, locale parity                                           |
| `vue3-composition`        | Vue 3 Composition API, reactivity, composables, lifecycle, script setup, watchers                        |
| `vue3-components`         | Vue 3 component design: props, events, slots, provide/inject, dynamic/async components                   |
| `vue3-templates`          | Vue 3 template syntax: directives, list/conditional rendering, bindings, native v-model                  |
| `vue3-builtin-components` | Vue 3 built-ins: Teleport, Suspense, KeepAlive, Transition, TransitionGroup                              |
| `vue3-reusability`        | Vue 3 custom directives and plugins (composables → vue3-composition)                                     |
| `vue3-performance`        | Vue 3 perf: shallowRef/markRaw, v-memo/v-once, async components, SSR perf                                |
| `design-ux`               | UI quality, design decisions, visual hierarchy, accessibility, responsive UX, micro-interactions         |
| `design-scss`             | SCSS design system: tokens, mixins, animations, utilities, component-scoped patterns                     |
| `vue-ssr-design`          | Design delegation routing, when to use design agent, mixed-task splitting, starter-kit design philosophy |
| `vuetify-components`      | Vuetify 4 components, forms, data tables, icons, theming, dialogs, navigation                            |
| `frontend-design`         | Greenfield/standalone distinctive UI (non-kit); in-kit UI → design agent + design-scss/vuetify-components |
| `review`                  | Code review of branch / PR / diff                                                                        |
| `vue-ssr-release`         | Release workflow, version bump, CHANGELOG generation, release branch                                     |
