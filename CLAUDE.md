# CLAUDE.md — Vue SSR Starter Kit

> Vue 3 + Express SSR starter kit with authentication, i18n, Vuetify 4, admin panel, and MongoDB. Hard rules only — project knowledge lives in skills (`.claude/skills/`).

---

## 🎨 Visual gate (rendered output)

**Verification is consent-gated.** After ANY task that changes rendered output (`.vue`/`.scss` under `src/views/` or `src/components/`), end the reply with a visual-QA offer alongside the validation offer — never uninvited, never omitted. It captures the touched routes and grades them against `brand-art-direction`; route findings to `design`, then re-run until clean. Quality never depends on the offer being accepted.

---

## 🚨 Task completion protocol

After completing ANY task that changes the project, before responding:

1. Run: `git diff --name-only HEAD && git ls-files --others --exclude-standard`
2. **Changelog** — for changelog-worthy changes (feature, bug fix, behavior/UI/i18n, or **product** dependency change), silently add a curated entry under `## [Unreleased]` in `CHANGELOG.md` per `vue-ssr-release`. Skip by purpose, not path: `.claude/` config incl. its deps, reformatting, lockfile-only, test-only, internal-docs. Unconditional — never waits on validation; never bump the version or commit.
3. **Validation is opt-in** — if any `.vue`/`.js`/`.mjs`/`.scss`/`.css` changed, do NOT validate automatically. Offer it at the end of the reply; delegate to `validation` ONLY on acceptance or an explicit request this turn.
4. On failure → fix it yourself, re-delegate, repeat until `validation` reports all-pass.

At most two end-of-task questions are sanctioned, each firing only when its condition holds: the visual gate above and this validation offer. **Never ask about the changelog** — add it silently. An agent workflow the user explicitly invoked (e.g. `release`) may prompt within its own flow — not governed by this count. Omitting an offer whose condition holds, or running a gate unasked, is a protocol violation.

---

## Hard rules

**No auto-commit** — Never `git commit`/`push`/`tag`/`rebase`/`reset --hard` unless the user explicitly requests it this turn ("ok"/"finalise" ≠ a request; read-only git is always allowed). Commit format: `[$branch] content`. **No `Co-authored-by` trailer or any mention of a non-human contributor on any commit, ever** — commit author is always the user's own git account, full stop. **Exception: "release"** — full release process (CHANGELOG, version bump, commit, push, tag).

**English only** — All persisted artefacts (code, markdown, skills, commits, PR descriptions) in English. Conversation with the user: any language. Non-English in a persisted file = defect to fix before completing.

**No confidential information** — Public, open-source (MIT) repository. Never write real credentials, keys, tokens, passwords, private hostnames/IPs, or SSH details anywhere in it — code, docs, commits, or `.claude/` config. `.env.example` and docs carry placeholders only; production infra is referenced by name only (private Ops tooling), never inlined.

**No code comments** — No `//`/`/* */`/`<!--` in `.vue/.js/.scss/.css`. Exception: empty catch blocks need `console.error(err)`. Refactor with self-explanatory names and named helpers, never an explanatory comment.

**SCSS externalized** — Every Vue component with styles has its own `.scss` file referenced via `<style lang="scss" scoped src="./ComponentName.scss"></style>`.

**i18n mandatory** — All user-visible text via `t('key')`. No hardcoded strings in templates.

**SCSS variables** — No hardcoded colors, spacings, or font sizes. Use `styles/variables.scss`.

**Composition API only** — No Options API. Always `<script setup>`.

**Shared factorization** — Reusable logic in `src/shared/`. Never duplicate code.

**ObjectId validation** — Always `parseObjectId()` from `dbHelpers.js` before MongoDB queries.

**catch blocks** — Always `console.error(err)`. Never empty catch.

**Regression = audit, not patch** — Never iterate patches on a regression. Stop, restart the analysis, find the real root cause, fix the cause not the symptom. Applies everywhere (SCSS, JS, SSR, MongoDB).

**No over-engineering** — Keep it simple. YAGNI.

---

## Agents directory

10-agent fleet. Validation: `validation` only, orchestrator-delegated (see Sub-agent orchestration).

| Agent       | Trigger (delegate when…)                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- |
| `vue`       | Vue components **(logic/state — styling → `design`)**, composables, Pinia stores, routing, unit tests |
| `server`    | `server.js`, `src/api/**`, server-only `src/shared/**` — Express, MongoDB, sessions           |
| `design`    | UI/UX, SCSS, Vuetify theming, accessibility, responsive layout — **produces** visual work (grading → `visual-qa`) |
| `translate` | Any change to `src/translate/*.json`                                                          |
| `content`   | Editorial content: LinkedIn, page copy, README, **daily execution** growth advisory (what to write next) |
| `marketing` | Strategy: positioning, monetization stance, campaigns, channels, **funnel-level** growth      |
| `visual-qa` | Offer-gated visual **grading** of changed views — read-only, never uninvited, never edits     |
| `review`    | Review a branch / PR / diff — read-only, structured report                                   |
| `release`   | User says "release" — version bump, CHANGELOG, branch, commit/push/tag proposal              |
| `validation`| Post-task validation only — orchestrator-called, never by sub-agents                         |

**Quick delegation card** — route by file path first, then intent. Multiple agents can work in parallel on independent scopes.

---

## Sub-agent orchestration

These rules override any contrary suggestion from a skill or tool documentation. A user instruction in the current turn always wins.

1. **Validation is centralized and opt-in** — NEVER run `npm test/lint/format/build/validate` yourself. Only the **`validation` agent** validates, and only when the user opts in per the Task completion protocol. No other agent may run validation. Pipeline: `vue-ssr-validation`.
2. **Sub-agent contract** — Scoped work → no validation → no comments → structured summary (what/files/blockers) → stay in scope. Report out-of-scope discoveries, don't act on them.
3. **Fleet** — Split by independent file boundaries, self-contained prompts (no prior context); fleet members never run validation and never delegate to another sub-agent (flat only — see `claude-anthropic` rule 16).
4. **Reuse before writing** — Search `src/shared/`, `src/composables/`, existing modules before adding utility code. Key shared: `apiFetch`, `parseObjectId`, `parsePagination`, `findUserSafe`, `generateSecurityCode`, `escapeHtml`.
5. **Plan escalation (automatic)** — whenever a task needs upfront analysis, exploration, or design work and the session runs below Opus, launch the built-in Plan/Explore agents (not the 10-agent fleet) with `model: opus` immediately — announce in one line, never ask. Exception: the user declined escalation (this task or standing). Incorporate the returned plan faithfully, never re-derive it. Trivial lookups stay inline.
6. **Task parallelization** — Track every user task as a `TaskCreate` entry. Before starting a new task while another is `in_progress`, compare footprints: overlapping/unknown → `addBlockedBy` and queue (read-only research allowed, no writes until unblocked); disjoint → `in_progress` and run in parallel (rule 3's file-boundary test, extended across time). `CHANGELOG.md`'s `## [Unreleased]` section is exempt. `validation` always waits for every task to leave `in_progress`. Announce queuing in one line, never ask.

---

## Path-scoped rules

Apply every `.claude/rules/` file whose `paths:` frontmatter glob matches the files being edited. Rules are lightweight guardrails; skills carry the workflows.

---

## Fleet verification contract

Read by fleet-wide campaigns driven from `e-xode/scripts` (dependency/security updates across all
apps — see `e-xode/scripts#9`). Those campaigns are **not** run by this repo's agents and must not
guess these values. Keep this block accurate; it is the interface, not documentation. Two traps:
`npm test` without `:run` starts Vitest in watch mode and hangs forever outside CI — always call
`npm run test:run`. `audit` is not a merge gate — it judges repo state, not a diff, and can go red
with no new commit; never add it to `required_status_checks`. The PR gate is `deps-review`.

| Key | Value |
| --- | --- |
| `install` | `npm ci` |
| `test` | `npm run test:run` |
| `lint` | `npm run lint:check` |
| `build` | `npm run build` |
| `full` | `npm run validate` (lint serially, then format:check + build + test:run in parallel) |
| `server` | vps671607 |
| `container` | `e-xode.vue-ssr` (port 3002, behind `e-xode.proxy`) |
| `deploy` | `cd /home/e-xode.vue-ssr && ./deploy.sh` (symlink → `e-xode/scripts`) |
| `smoke` | `curl -sf https://vue-ssr.e-xode.net/` → 200 |
| `rollback` | ⚠️ no direct lever — `deploy.sh` runs `docker pull …:latest` unpinned. Rolling back means rebuilding an earlier commit via CI. See `e-xode/scripts#10`. |

---

## Meta

Governance → `claude-anthropic` skill. Skill authoring → `skill-creator` skill.

---

## Skills index

Skills load on demand by description matching. Families:

- **Project:** `vue-ssr-architecture`, `vue-ssr-auth`, `vue-ssr-server`, `vue-ssr-deployment`, `vue-ssr-validation`, `vue-ssr-design`, `vue-ssr-release`
- **Vue 3:** `vue3-composition`, `vue3-components`, `vue3-templates`, `vue3-builtin-components`, `vue3-reusability`, `vue3-performance`
- **Vuetify 4:** `vuetify-overview`, `vuetify-theming`, `vuetify-layout`, `vuetify-components`, `vuetify-forms`, `vuetify-data`, `vuetify-icons`
- **Design:** `brand-art-direction`, `design-ux`, `design-scss`, `frontend-design`
- **Marketing:** `marketing-strategy`, `marketing-content`, `content-strategy`, `seo`
- **Workflow:** `translate`, `review`, `skill-creator`, `claude-anthropic`, `starter-kit-adapt`
