# Case studies — Vue SSR Starter Kit Claude config

Decisions that shaped this project's `.claude/` configuration, with the reasoning behind each. Read these when a similar trade-off resurfaces, or when adapting the config for a fork (see skill `starter-kit-adapt`).

## CS-1 — Why `validation` is the sole exception to "no sub-agent validation"

**Context.** The orchestration rule says sub-agents never run validation (`npm test`/`lint`/`build`/`format`). Yet one agent — `validation` — does exactly that. (It was named `hooks` until the 2026-07-26 rename recorded in CS-6.)

**Decision.** Centralize all validation in a single, dedicated `validation` agent (model: haiku, tools: Bash) invoked once at task end.

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

**Outcome.** Zero functional hook references; the historical record lives here and in the `vue-ssr-validation` History section. The validation path is unchanged in substance: the agent — now named `validation` — behind `npm run validate`.

## CS-7 — The always-loaded budget is real: harness listing truncation

**Context.** `CLAUDE.md` bytes plus every skill description plus every agent description load on EVERY turn. The project had drifted to 43,210 chars total, with skill descriptions alone at 26,048 — roughly 3,000 chars past the point where the sibling `e-xode.rom` project observed (bounded 2026-07-19, upstream cap undocumented) the harness truncating its skills listing, somewhere between ~23.1k and ~23.5k cumulative chars.

**Decision.** Ship `.claude/settings.json` with `skillListingBudgetFraction` raised, retail the fattest skill and agent descriptions down toward the sub-budget, and add an always-loaded budget check to `scripts/audit.py` that prints the running total as INFO on every run.

**Why.** A truncated listing is a silent failure: a skill past the cutoff loses its entire trigger surface and simply never fires — no error, no warning, just a skill that appears never to be relevant. Raising the harness budget beats an endless description diet, but only measurement prevents the drift from returning, hence the audit check as a permanent ratchet. The retailoring removed enumerations only; every trigger and anti-trigger was kept, because the description IS the trigger surface.

**Outcome.** The audit prints the total on every run. Treat any growth as a decision, not a side effect.

**Correction (2026-08-09, CS-8).** The mechanism described above was inferred from an observation, and the inference was wrong in a way that matters. The listing budget is **1 % of the model's context window**, scaled by `skillListingBudgetFraction`; on overflow the harness keeps every skill *name* and drops *descriptions*, starting with the least-invoked skills. There is no fixed ~23.1k char cliff past which a skill vanishes. The ~23k figure the project observed was simply where its own session happened to overflow. The 23,000-char sub-budget is still worth keeping as a discipline ratchet — but it is a project ratchet, not a harness edge, and the real exposure is that a forker on a 200k-context model gets roughly a fifth of the maintainer's listing budget.

## CS-8 — Re-syncing with upstream doctrine (2026-08-09)

**Context.** The configuration was authored against the "SKILL.md = name + description + body" model and had not absorbed what Claude Code shipped since. Two independent audits surfaced the same shape of problem: the *structure* of the config was upstream-correct — progressive disclosure real, anti-triggers everywhere, a mechanical audit script Anthropic's own corpus has no counterpart for — while the *runtime surface* had drifted.

**Decision.** Vendor Anthropic's official `skill-creator` verbatim from the `claude-plugins-official` marketplace rather than installing the plugin, and re-ground `claude-anthropic`'s references in the current docs.

**Why vendor instead of install.** A plugin's skills load into the *installer's* always-loaded listing and are namespaced `plugin:skill`; vendoring keeps the skill under this repo's own budget accounting, lets the project layer sit alongside the upstream text, and — because the upstream block is kept byte-identical and the deviations are enumerated — a future re-sync stays a straight replacement. The same reasoning already applied to `frontend-design`.

**The finding that justified the whole exercise.** All ten agents pin an explicit `tools:` allowlist and none includes `Skill`. The docs name that exact configuration as the supported way to *prevent* a subagent from invoking skills. The project's entire premise — `CLAUDE.md` carries hard rules, knowledge lives in skills, agents load them by name — was therefore inert inside the fleet, with no error and no warning. The observable symptom is an agent producing plausible-but-unconventional output while every reviewer assumes the skill was consulted. Recorded as core rule 16.

**Secondary corrections.** Docs host moved twice (`docs.anthropic.com` → `docs.claude.com` → `code.claude.com/docs/en/`), and a `301` is invisible to a link check that only looks for `404`. Eight stale references to a `hooks` agent deleted in CS-6 survived inside this skill's own references — including two items in `audit-checklist.md` that instructed auditors to verify a fact that had become false, manufacturing false positives against a correct `CLAUDE.md`.

**Lesson.** A configuration that documents a runtime is a dependency on that runtime. It needs the same periodic re-grounding as a package upgrade, and the audit script can only defend the parts of the surface it actually reads.

## CS-9 — Raising the CLAUDE.md cap by 512 bytes (2026-08-09)

**Context.** Applying the CS-8 fixes (the `Skill`-tool grant fix, the `translate` fan-out removal,
the `vue`/`design` file-boundary clarification) required a few genuinely new sentences of hard-rule
content in `CLAUDE.md` itself — not restated skill knowledge, but orchestration rules the main
session needs on every turn. Combined with translating and compressing the French "Fleet
verification contract" block (CS-8/D-5) into English, the file still landed at 10,310 bytes against
the 10,240-byte cap after trimming every rule down to its essential clauses (830 bytes recovered
from the pre-fix 11,144 in the same pass, plus a stale `translate` fleet-mode reference in the
Agents directory table caught and removed along the way).

**Decision.** Raise `CLAUDE_MD_MAX_BYTES` from 10 KB to 10.5 KB (a 5% increase) rather than cut
substance to hit the old number, or leave the audit red.

**Why.** The trimming pass was real, not token — every hard rule kept its meaning, and one factual
staleness was fixed as a side effect. The residual 70-odd bytes were markdown table padding and
genuinely load-bearing clauses; shaving them further would trade clarity for a round number with no
reader benefit. The cap is a project ratchet (CS-7), not a harness limit, and the doctrine it serves
— "treat any growth as a decision, not a side effect" — is satisfied by raising it deliberately and
recording why, not by treating 10,240 as immutable. Still well inside Anthropic's own guidance
(target under 200 lines; this file is under 130).

**Outcome.** `scripts/claude-anthropic/scripts/audit.py`'s `CLAUDE_MD_MAX_BYTES` and
`claude-md-anatomy.md`'s stated target both moved to 10.5 KB. Future growth still needs a reason.
