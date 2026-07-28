---
name: claude-anthropic
description: "Govern Claude/Anthropic configuration of the Vue SSR Starter Kit (e-xode/vue-ssr): rules and audit method for CLAUDE.md and everything under .claude/. Trigger when creating, modifying, reviewing or auditing a skill / rule / sub-agent / CLAUDE.md, deciding rule vs skill, or asking about Anthropic doctrine (progressive disclosure, agent design). Co-load with skill-creator when authoring a skill. Don't use for: the create/eval/iterate loop (→ skill-creator), post-task code validation (→ vue-ssr-validation + validation agent), app architecture (→ vue-ssr-architecture), framework lifecycle hooks (Vue concept), or post-fork adaptation of the whole config (→ starter-kit-adapt)."
---

# Claude / Anthropic configuration — Vue SSR Starter Kit

> Owns the rules and audit method for the project's `.claude/` folder and `CLAUDE.md`. Source of doctrine for how this project applies Anthropic's skill and agent patterns.

## What this skill does (and does not)

| In scope                                                     | Out of scope                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Rules for writing/editing `CLAUDE.md`                        | Validating modified application code (→ `vue-ssr-validation` + `validation` agent) |
| Anatomy of a project skill (frontmatter, references, budget) | The workflow of drafting and evaluating a new skill (→ `skill-creator`)       |
| Anatomy of a project sub-agent                               | App architecture knowledge (→ `vue-ssr-architecture`)                         |
| Anatomy of path-scoped rules (`.claude/rules/`)              | Auth flow and security (→ `vue-ssr-auth`)                                     |
| Validation-path doctrine (agent-only, no native hooks)       | Deployment and CI/CD (→ `vue-ssr-deployment`)                                 |
| Audit checklist + automated `scripts/audit.py`               | Skill description optimisation tooling (→ `skill-creator`)                    |
| Anthropic doctrine: progressive disclosure, agent design     |                                                                               |

## Division of responsibilities — `claude-anthropic` ↔ `skill-creator`

The two skills are complementary. Load both when working on a skill.

| Concern                                                                | Owner              |
| ---------------------------------------------------------------------- | ------------------ |
| Generic create/evaluate/iterate workflow                               | `skill-creator`    |
| Eval harness, benchmark scripts                                        | `skill-creator`    |
| Description-optimisation tooling                                       | `skill-creator`    |
| Project description conventions (discriminating, pushy, anti-triggers) | `claude-anthropic` |
| Skill naming, placement under `.claude/skills/`, folder layout         | `claude-anthropic` |
| `SKILL.md` anatomy and token budget for this project                   | `claude-anthropic` |
| Project anti-patterns and case studies                                 | `claude-anthropic` |
| Post-creation audit and `CLAUDE.md` skills-index update                | `claude-anthropic` |
| Anthropic doctrine (model spec, progressive disclosure, agent design)  | `claude-anthropic` |

When this skill hands off, use the convention: `➜ See skill: skill-creator — <reason>`.

## Core rules (the strict minimum)

1. **`CLAUDE.md` ≤ 10 KB / ~2500 tokens.** Hard rules only. Knowledge belongs in skills. See [references/claude-md-anatomy.md](./references/claude-md-anatomy.md).
2. **One skill = one subject.** Discriminating description, explicit anti-triggers, pushy phrasing to combat under-triggering. See [references/skill-anatomy.md](./references/skill-anatomy.md).
3. **`SKILL.md` is method + index.** Detailed knowledge goes in `references/` (one file per sub-topic, ≤ 300 lines each). Keep `SKILL.md` under ~500 lines (~50 KB hard warn).
4. **Sub-agents have a strict contract:** clear scope, no validation (except the `validation` agent), structured return. See [references/agent-anatomy.md](./references/agent-anatomy.md).
5. **No duplication between skills.** Search existing skills before authoring a new one. If overlap is unavoidable, define a "Division of responsibilities" table in both skills.
6. **English only** in all persisted artefacts (skills, references, agents, CLAUDE.md, commits, PRs).
7. **No code comments in `CLAUDE.md` or `SKILL.md`** outside fenced code blocks. Prose is the medium.
8. **Cross-references use a stable convention:** `➜ See skill: <name> — <reason>` (greppable, visible in diffs).
9. **`name` in frontmatter == folder name.** Mechanical, enforced by `scripts/audit.py`.
10. **Validation is agent-only — the project has no native hooks.** The former `.claude/hooks/` wiring and its `settings._json` kill switch were removed on 2026-07-26; validation runs solely through the `validation` agent, delegated by the orchestrator per the Task completion protocol. `➜ See skill: vue-ssr-validation` — the validation pipeline. History: [references/case-studies.md](./references/case-studies.md) CS-6.
11. **Scripts belong to a skill.** Executable tooling lives in `.claude/skills/<owner>/scripts/`, never in a top-level `.claude/scripts/` pool. Enforced by `scripts/audit.py`.
12. **Description = trigger surface.** A description carries triggers + anti-triggers only; enumerated knowledge belongs in the body. Skill descriptions: 80–1,536 chars (hard listing cap), with a ≤ 600-char target for secondary domains — only primary routing skills earn more. Agent descriptions: 80–900 chars (audit-warned). Put the most important trigger information first.
13. **Rules are lightweight guardrails.** `.claude/rules/` files are path-scoped constraints (< 2 KB, imperative, no references). They complement skills (which carry knowledge). Use rules for hard DON'Ts tied to specific file paths; use skills for how-to procedures. See [references/rules-anatomy.md](./references/rules-anatomy.md).
14. **Domain prefixes:** `vue-ssr-*` (project-specific), `vue3-*` (Vue 3), `vuetify-*` (Vuetify 4), `design-*` (SCSS/UX/art-direction), `marketing-*` (acquisition). Cross-cutting skills (`translate`, `review`, `seo`, `skill-creator`, `claude-anthropic`, `starter-kit-adapt`) have no prefix.
15. **Always-loaded budget.** `CLAUDE.md` bytes + every skill description + every agent description load EVERY turn; the sum is capped at 43,000 chars (WARN) / 47,000 chars (ERROR), enforced by `scripts/audit.py` (which prints the current total as INFO on each run — treat it as a ratchet, never let it grow without cause). Sub-budget: skill descriptions alone stay ≤ 23,000 chars (audit-warned). `.claude/settings.json` raises the harness's own listing budget (`skillListingBudgetFraction`), which makes the 23k sub-budget a discipline ratchet rather than an active truncation edge — still, verify the full skill listing renders on a fresh session before spending any headroom it frees. See [references/case-studies.md](./references/case-studies.md) CS-7.

## Audit method

Run before any non-trivial change to `.claude/` and after creating/modifying a skill.

### Step 1 — Automated checks

```bash
python3 .claude/skills/claude-anthropic/scripts/audit.py
python3 .claude/skills/claude-anthropic/scripts/audit.py --json
```

Covers 18 mechanical check groups (file sizes, frontmatter validity, naming, description budgets, cross-refs, English-only, no-comments, and more) — run it to see the full list of checks. Most checks emit a finding only on failure; the always-loaded budget always prints its total as INFO. A clean run prints `Executed N check groups … All checks passed.`. Exit code 1 on any error.

### Step 2 — Manual checks

Walk [references/audit-checklist.md](./references/audit-checklist.md). Each item is tagged `[AUTO]` (covered by the script) or `[MANUAL]` (qualitative — discriminating description, pertinent anti-triggers, semantic overlap between skills, "Division of responsibilities" table coherence between twin skills, true token budget).

### Step 3 — Anti-pattern sweep

Cross-check the work against [references/antipatterns.md](./references/antipatterns.md). Most defects in this project's `.claude/` are recurring patterns documented there.

### Step 4 — Propose, never auto-fix

If issues are found, propose corrections to the user. **Never silently rewrite** a skill, an agent, or `CLAUDE.md`. The audit script has no `--fix` flag for the same reason.

## Workflows

### Create a new skill

1. **(this skill)** Confirm there is no existing skill covering the topic. Define scope, name (kebab-case, prefixed per rule 14), placement, and the discriminating description (with anti-triggers).
2. **(this skill)** Plan the `SKILL.md` structure (method + index) and the `references/` split (one file per sub-topic, ≤ 300 lines each).
3. **➜ See skill: skill-creator — drives the draft, test prompts, eval iteration, and description-optimisation loop.**
4. **(this skill)** Run `scripts/audit.py` and the manual checklist on the produced skill.
5. **(this skill)** Append the skill to the Skills index in `CLAUDE.md` (one row, matching the existing format).
6. **(this skill)** If the new skill shares a domain with another (twin skills), add a "Division of responsibilities" table in **both** sides.

### Modify `CLAUDE.md`

1. Confirm the change is a **hard rule** (operational, project-wide, non-negotiable). Knowledge belongs in a skill instead.
2. Edit with the smallest surface possible; preserve section structure.
3. Re-run `scripts/audit.py` — it enforces the 10 KB budget, the always-loaded budget, and the agent↔CLAUDE.md cross-refs.

### Add a sub-agent

1. Read [references/agent-anatomy.md](./references/agent-anatomy.md) — the agent contract is strict (scope, no validation, structured return).
2. Create `.claude/agents/<name>.md` with frontmatter (`name`, `description`, recommended `tools`, optional `model`).
3. Add a row to the `## Agents directory` table in `CLAUDE.md`.
4. Run `scripts/audit.py` — it will fail until both sides reference each other.

### Add or modify a rule

1. Read [references/rules-anatomy.md](./references/rules-anatomy.md) — covers anatomy, conventions, and the decision flowchart (rule vs skill vs CLAUDE.md).
2. Confirm the content is a **constraint/guardrail** (not knowledge). If it needs examples, references, or > 2 KB, it should be a skill instead.
3. Create `.claude/rules/<descriptive-name>.md` with `paths:` frontmatter (glob pattern targeting the relevant files).
4. Keep content concise (< 2 KB), imperative voice, English only, no code comments.
5. If a skill already covers the same domain, add a pointer from the rule to the skill: "Full patterns: see skill `<name>`."
6. Run `scripts/audit.py` — the rules-structure check validates it.

### Introduce a native hook (none exist today)

The project runs zero native hooks — the previous wiring was removed on 2026-07-26 ([references/case-studies.md](./references/case-studies.md) CS-6). Introducing one is an architecture decision: get explicit user approval, wire it in `.claude/settings.json`, and record the decision in case-studies.

## Where to look (routing table)

| If you need…                                           | Read                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| Why `CLAUDE.md` is so terse / what belongs there       | [references/claude-md-anatomy.md](./references/claude-md-anatomy.md) |
| How to write a discriminating description              | [references/skill-anatomy.md](./references/skill-anatomy.md)         |
| How to choose `tools` / `model` for an agent           | [references/agent-anatomy.md](./references/agent-anatomy.md)         |
| When to use rules vs skills / rule anatomy             | [references/rules-anatomy.md](./references/rules-anatomy.md)         |
| Full audit checklist (auto + manual)                   | [references/audit-checklist.md](./references/audit-checklist.md)     |
| Known anti-patterns and corrections                    | [references/antipatterns.md](./references/antipatterns.md)           |
| Why the project is organised this way (real decisions) | [references/case-studies.md](./references/case-studies.md)           |
| Anthropic official documentation                       | [references/official-links.md](./references/official-links.md)       |
