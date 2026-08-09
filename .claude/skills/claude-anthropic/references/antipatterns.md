# Anti-patterns (observed in this project or seen elsewhere)

Each anti-pattern includes a **symptom**, a **why it is bad**, and a **correction**.

## A. `CLAUDE.md`

### A1. Pasting a skill's intro into `CLAUDE.md`

- **Symptom.** A new `## SSR` section appears in `CLAUDE.md` with two paragraphs explaining when to use `onMounted`.
- **Why bad.** Costs tokens on every turn for content the agent only needs occasionally. Duplicates the `vue-ssr-architecture` skill.
- **Fix.** Delete the section. The skill is already in the Skills index; the agent will load it on demand.

### A2. Decorative emojis or "Tips" sections

- **Symptom.** "💡 Tip: prefer computed over watch".
- **Why bad.** Tips are best practices, not hard rules. Hard rules only in `CLAUDE.md`.
- **Fix.** Move the tip into the relevant skill (e.g., `vue3-composition`).

### A3. Oversized skills index

- **Symptom.** Skills index occupies 60+ lines with full trigger descriptions.
- **Why bad.** The index should aid discovery, not replicate skill descriptions.
- **Fix.** Use compact family groupings with one-line per skill.

## B. Skills

### B1. Vague description

- **Symptom.** `"Helps with Vue components."`
- **Why bad.** Will never trigger reliably and will not discriminate from `vue3-composition` or `vuetify-components`.
- **Fix.** State framework version, file paths, in-house systems, trigger keywords, anti-triggers.

### B2. Missing anti-trigger clause

- **Symptom.** Description lists triggers but no `Don't use for: …`.
- **Why bad.** Skill triggers on adjacent topics, conflicts with neighbouring skills.
- **Fix.** Append a `Don't use for:` clause naming the alternative skill / agent.

### B3. Rule lives only in a reference

- **Symptom.** A hard rule (e.g., "never use window at top level") is mentioned only in `references/ssr-pitfalls.md`.
- **Why bad.** References are loaded on demand. If they are skipped, the rule is invisible.
- **Fix.** Surface the rule briefly in `SKILL.md` with a pointer.

### B4. `SKILL.md` is the encyclopedia

- **Symptom.** `SKILL.md` is 1200 lines, contains 30 examples, no `references/`.
- **Why bad.** Always-loaded body explodes context.
- **Fix.** Move examples to `references/`. Keep `SKILL.md` as method + index. Aim for ≤ 500 lines.

### B5. Twin skills without a "Division of responsibilities" table

- **Symptom.** Two skills cover related topics; neither says which owns what.
- **Why bad.** Agent picks one and ignores the other.
- **Fix.** Add the same `Division of responsibilities` table in both skills.

## C. Sub-agents

### C1. Sub-agent runs validation

- **Symptom.** The `vue` agent runs `npm test` after editing a component.
- **Why bad.** Violates the centralised-validation rule.
- **Fix.** Remove validation calls. Orchestrator delegates to `validation` after return.

### C2. Sub-agent delegates to another sub-agent

- **Symptom.** The `design` agent calls the `server` agent to fix an SSR error.
- **Why bad.** Sub-agents stay flat; the orchestrator owns delegation.
- **Fix.** Report the error in structured return; orchestrator decides the follow-up.

### C3. Out-of-scope edits

- **Symptom.** Sub-agent fixes a "while we're at it" bug in an unrelated file.
- **Why bad.** Inflates the diff, breaks the orchestrator's mental model.
- **Fix.** Report discovery in structured return. Orchestrator dispatches separately.

## D. Native hooks

### D1. Reintroducing native hooks ad hoc

- **Symptom.** A `PreToolUse`/`PostToolUse`/`Stop` hook appears in `.claude/settings.json`, e.g. re-running `eslint` after every Edit or re-adding a Stop-time validation chain.
- **Why bad.** The project removed its native-hook wiring on 2026-07-26 (case-studies CS-6): validation is centralised in the `validation` agent and offer-gated. Per-edit hooks are slow, noisy, and duplicate that path.
- **Fix.** Treat any new hook as an architecture decision — explicit user approval plus a case-studies entry — never an ad-hoc addition.

## E. Workflow / process

### E1. Editing locale JSON directly

- **Symptom.** Orchestrator edits `src/translate/en.json` directly to add a key.
- **Why bad.** Locale files must stay in sync; the `translate` agent enforces this.
- **Fix.** Delegate to the `translate` agent.

### E2. Validating after every micro-change

- **Symptom.** Orchestrator runs `npm test` after each `edit` call.
- **Why bad.** Violates "validation is centralised at task end". Wastes time.
- **Fix.** Make all changes, then the orchestrator offers validation and delegates to the `validation` agent on acceptance.

### E3. Patching a regression instead of auditing

- **Symptom.** A CSS regression appears; fixer adds `!important` to override it.
- **Why bad.** Violates the Golden Rule. Cause remains; debt doubles.
- **Fix.** Apply the CLAUDE.md hard rule: stop, restart the analysis, find the real root cause, fix the cause not the symptom.

### E4. Global script pool (`.claude/scripts/`)

- **Symptom.** Scripts placed in a top-level `.claude/scripts/` folder, not attached to any skill.
- **Why bad.** Violates Anthropic's official skill anatomy. Orphan scripts have no owner, no documentation, no skill-trigger.
- **Fix.** Move each script under the owning skill: `.claude/skills/<owner>/scripts/<script>`. Enforced by `scripts/audit.py` check #13.

## F. Rules (`.claude/rules/`)

### F1. Rule that duplicates a skill's body

- **Symptom.** A rule file contains 40 lines explaining SSR architecture.
- **Why bad.** The rule loads on every matching file, duplicating the `vue-ssr-architecture` skill.
- **Fix.** Keep only the guardrail in the rule. Let the skill carry the knowledge.

### F2. Unconditional rule that should be in `CLAUDE.md`

- **Symptom.** A rule file has no `paths:` frontmatter.
- **Why bad.** Same cost as `CLAUDE.md` content but less discoverable.
- **Fix.** Move into `CLAUDE.md` or add a proper `paths:` glob.

### F3. Rule too large (should be a skill)

- **Symptom.** A rule file exceeds 2 KB.
- **Why bad.** Rules are designed to be lightweight guardrails.
- **Fix.** Extract knowledge into a skill. Keep only the core constraint in the rule.
