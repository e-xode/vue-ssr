# Case studies — Vue SSR Starter Kit Claude config

Decisions that shaped this project's `.claude/` configuration, with the reasoning behind each. Read these when a similar trade-off resurfaces, or when adapting the config for a fork (see skill `starter-kit-adapt`).

## CS-1 — Why `hooks` is the sole exception to "no sub-agent validation"

**Context.** The orchestration rule says sub-agents never run validation (`npm test`/`lint`/`build`/`format`). Yet one agent — `hooks` — does exactly that.

**Decision.** Centralize all validation in a single, dedicated `hooks` agent (model: haiku, tools: Bash) invoked once at task end.

**Why.** Validation is deterministic, read-mostly, and cheap to run in one place. Letting every task agent validate would run the battery N times for one logical task and blur each agent's scope. One exception, clearly named, beats a fuzzy rule. See `references/agent-anatomy.md` and skill `vue-ssr-validation`.

## CS-2 — Why `skill-creator` stays separate from `claude-anthropic`

**Context.** Both skills concern authoring skills. Merging them is tempting.

**Decision.** Keep them separate with an explicit "Division of responsibilities" table in `claude-anthropic`.

**Why.** `skill-creator` is a *portable* workflow (draft → eval → iterate) that survives a fork unchanged. `claude-anthropic` is *project doctrine* (naming, placement, anti-triggers, audit, CLAUDE.md budget) that a fork rewrites for its own domain. Splitting along the portable/project seam keeps the generic loop reusable and the project rules swappable. Co-load both when authoring.

## CS-3 — Adding `build` to the validation battery

**Context.** The battery was format → lint → test. SSR import leaks and build-time failures slipped through because unit tests mock modules and lint is static.

**Decision.** Insert `npm run build` (client + server SSR bundles) between lint and test: format → lint → build → test. Short-circuited to `.vue`/`.js` changes only — build is the slow step and SCSS/doc edits don't need it.

**Why.** For an SSR app the build is the only guard that exercises the real client/server boundary and module graph. It is the highest-value check, but also the slowest, so the short-circuit table keeps it off non-code changes. See skill `vue-ssr-validation` and rule `client-server-boundary`.

## CS-4 — No Socket.IO guard rules (adapted from the sibling `rom` project)

**Context.** The sibling project `e-xode.rom` ships `server-security` / `server-scope-guard` rules mentioning `ws:`/`wss:` CSP entries, `io.close()` shutdown, and socket event handlers, because it runs Socket.IO.

**Decision.** Port the three guard rules (`client-server-boundary`, `server-scope-guard`, `server-security`) but strip every Socket.IO assumption.

**Why.** This starter kit has no Socket.IO. Copying rom's rules verbatim would assert patterns that don't exist here — actively misleading. The adapted rules match the real `server.js`: `ws:`/`wss:` appear only in dev (Vite HMR), shutdown is `await mongoClose()` → `process.exit(0)`, and there are no socket handlers. Rules must describe the codebase as it is, not as a sibling's is. Grounding each rule in the actual source is the lesson.

## CS-5 — Splitting `vuetify-components` into a `vuetify-*` family

**Context.** Vuetify knowledge lived in one `vuetify-components` skill (a SKILL.md plus six `references/` files). The sibling `rom` project uses seven separate `vuetify-*` skills.

**Decision.** Split into seven granular skills: `vuetify-overview`, `vuetify-theming`, `vuetify-layout`, `vuetify-forms`, `vuetify-data`, `vuetify-components` (rescoped to display/feedback), `vuetify-icons`.

**Why.** Finer triggering: a forms question loads form content, not the whole Vuetify corpus — better progressive disclosure and lower token cost per task. Crucially, the name `vuetify-components` was **kept** as one of the seven, so every existing `(→ vuetify-components)` anti-trigger in other skills stays valid and no cross-references break. The domain-prefix convention (`vue3-*`, `vue-ssr-*`, `vuetify-*`, `design-*`) makes the family legible in the index.

## CS-6 — Native hooks: dormant, then removed (2026-07-26)

**Context.** The project shipped two validation wirings: native `Stop`/`PreToolUse` hooks (ten shell scripts under `.claude/hooks/`, wired through `.claude/settings._json`) AND the `CLAUDE.md` protocol making the orchestrator delegate to the `hooks` agent. The native path was kept **dormant** behind the `._json` kill switch because a known GitHub Copilot bug made shell-hook execution unreliable — silent failures, out-of-order runs, hung sessions. The scripts were kept maintained and cross-platform for a re-enable that never came.

**Decision.** Remove the native path outright: the ten scripts, the `README.md` describing them, `settings._json`, and `references/hooks-reference.md`. Rename the skill `vue-ssr-hooks` → `vue-ssr-validation`, scoped to the `npm run validate` battery. Scrub every functional reference from `CLAUDE.md`, the skills and the `claude-config` rule. Delete the stale `references/validation-battery.md`, which still described a `format → lint → test` stop-at-first-failure pipeline that `scripts/validate.mjs` had not implemented for months.

**Why.** With the deterministic-hook advantage void, the ready-to-flip fallback never earned its keep and had become an interpretation hazard: agents read "dormant guard" clauses as active tooling, and two documents disagreed about what the battery actually did. The name `hooks` was itself ambiguous across three meanings — native Claude hooks, Copilot hooks, Vue lifecycle hooks. One path, one name, one description of it.

**Outcome.** Zero functional hook references; the historical record lives here and in the `vue-ssr-validation` History section. The validation path is unchanged: the `hooks` agent behind `npm run validate`.

## CS-7 — The always-loaded budget is real: harness listing truncation

**Context.** `CLAUDE.md` bytes plus every skill description plus every agent description load on EVERY turn. The project had drifted to 43,210 chars total, with skill descriptions alone at 26,048 — roughly 3,000 chars past the point where the sibling `e-xode.rom` project observed (bounded 2026-07-19, upstream cap undocumented) the harness truncating its skills listing, somewhere between ~23.1k and ~23.5k cumulative chars.

**Decision.** Ship `.claude/settings.json` with `skillListingBudgetFraction` raised, retail the fattest skill and agent descriptions down toward the sub-budget, and add an always-loaded budget check to `scripts/audit.py` that prints the running total as INFO on every run.

**Why.** A truncated listing is a silent failure: a skill past the cutoff loses its entire trigger surface and simply never fires — no error, no warning, just a skill that appears never to be relevant. Raising the harness budget beats an endless description diet, but only measurement prevents the drift from returning, hence the audit check as a permanent ratchet. The retailoring removed enumerations only; every trigger and anti-trigger was kept, because the description IS the trigger surface.

**Outcome.** The audit prints the total on every run. Treat any growth as a decision, not a side effect.
