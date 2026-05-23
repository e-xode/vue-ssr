---
name: claude-anthropic
description: "Govern Claude/Anthropic configuration of the Vue SSR Starter Kit (e-xode/vue-ssr): rules and audit method for CLAUDE.md, skills under .claude/skills/, path-scoped rules under .claude/rules/, sub-agents under .claude/agents/, and hooks under .claude/hooks/. Trigger when creating, modifying, reviewing or auditing a skill / rule / sub-agent / CLAUDE.md / hook, when deciding between a rule vs a skill for a constraint, or when asking about Anthropic doctrine (model spec, agent design, progressive disclosure). Co-load with skill-creator when authoring a skill. Don't use for: the create/eval/iterate loop itself (→ skill-creator), post-task code validation (→ vue-ssr-hooks + hooks agent), app architecture (→ vue-ssr-architecture), or auth flow (→ vue-ssr-auth)."
---

# Claude / Anthropic configuration — Vue SSR Starter Kit

> Owns the rules and audit method for the project's `.claude/` folder and `CLAUDE.md`. Source of doctrine for how this project applies Anthropic's skill/agent/hook patterns.

## What this skill does (and does not)

| In scope                                                     | Out of scope                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Rules for writing/editing `CLAUDE.md`                        | Validating modified application code (→ `vue-ssr-hooks` + `hooks` agent) |
| Anatomy of a project skill (frontmatter, references, budget) | The workflow of drafting and evaluating a new skill (→ `skill-creator`)  |
| Anatomy of a project sub-agent                               | App architecture knowledge (→ `vue-ssr-architecture`)                    |
| Anatomy of path-scoped rules (`.claude/rules/`)              | Auth flow and security (→ `vue-ssr-auth`)                                |
| Hook events, format, project status                          | Deployment and CI/CD (→ `vue-ssr-deployment`)                            |
| Audit checklist + automated `scripts/audit.py`               |                                                                          |
| Anthropic doctrine: progressive disclosure, agent design     |                                                                          |

## Division of responsibilities — `claude-anthropic` ↔ `skill-creator`

| Concern                                                                | Owner              |
| ---------------------------------------------------------------------- | ------------------ |
| Generic create/evaluate/iterate workflow                               | `skill-creator`    |
| Eval harness, test prompts, assertions                                 | `skill-creator`    |
| Description-optimisation guidelines                                    | `skill-creator`    |
| Project description conventions (discriminating, pushy, anti-triggers) | `claude-anthropic` |
| Skill naming, placement under `.claude/skills/`, folder layout         | `claude-anthropic` |
| `SKILL.md` anatomy and token budget for this project                   | `claude-anthropic` |
| Project anti-patterns                                                  | `claude-anthropic` |
| Post-creation audit (`scripts/audit.py`) + `CLAUDE.md` index update    | `claude-anthropic` |
| Anthropic doctrine (model spec, progressive disclosure, agent design)  | `claude-anthropic` |

When this skill hands off, use the convention: `➜ See skill: skill-creator — <reason>`.

## Core rules (the strict minimum)

1. **`CLAUDE.md` ≤ 10 KB / ~2500 tokens.** Hard rules only. Knowledge belongs in skills. See [references/claude-md-anatomy.md](./references/claude-md-anatomy.md).
2. **One skill = one subject.** Discriminating description, explicit anti-triggers, pushy phrasing to combat under-triggering. See [references/skill-anatomy.md](./references/skill-anatomy.md).
3. **`SKILL.md` is method + index.** Detailed knowledge goes in `references/`. Keep `SKILL.md` under ~500 lines (~50 KB hard warn).
4. **Sub-agents have a strict contract:** clear scope, no validation (except the `hooks` agent), structured return. See [references/agent-anatomy.md](./references/agent-anatomy.md).
5. **No duplication between skills.** Search existing skills before authoring a new one. If overlap is unavoidable, define a "Division of responsibilities" table in both skills.
6. **English only** in all persisted artefacts (skills, references, agents, CLAUDE.md, commits, PRs).
7. **No code comments in `CLAUDE.md` or `SKILL.md`** outside fenced code blocks. Prose is the medium.
8. **Cross-references use a stable convention:** `➜ See skill: <name> — <reason>` (greppable, visible in diffs).
9. **`name` in frontmatter == folder name.** Mechanical, enforced by `scripts/audit.py`.
10. **Scripts belong to a skill.** Executable tooling lives in `.claude/skills/<owner>/scripts/`, never in a top-level `.claude/scripts/` pool. Enforced by `scripts/audit.py`.
11. **Description budget: 1,536 characters.** Put the most important trigger information first.
12. **Rules are lightweight guardrails.** `.claude/rules/` files are path-scoped constraints (< 2 KB, imperative, no references). Use rules for hard DON'Ts tied to specific file paths; use skills for how-to procedures. See [references/rules-anatomy.md](./references/rules-anatomy.md).

## Audit method

Run before any non-trivial change to `.claude/` and after creating/modifying a skill.

### Step 1 — Automated checks

```bash
python3 .claude/skills/claude-anthropic/scripts/audit.py
python3 .claude/skills/claude-anthropic/scripts/audit.py --json
```

Covers 14 mechanical checks (file sizes, frontmatter validity, name↔folder, description length + anti-trigger presence, duplicate names, broken relative links, agent frontmatter, agent↔CLAUDE.md cross-refs, skill-index↔folder coherence, English-only heuristic, no code comments in markdown, no global scripts pool, rules structure validation). Exit code 1 on any error.

### Step 2 — Manual checks

Walk [references/audit-checklist.md](./references/audit-checklist.md). Each item is tagged `[AUTO]` or `[MANUAL]`.

### Step 3 — Anti-pattern sweep

Cross-check against [references/antipatterns.md](./references/antipatterns.md).

### Step 4 — Propose, never auto-fix

If issues are found, propose corrections to the user. **Never silently rewrite** a skill, an agent, or `CLAUDE.md`.

## Workflows

### Create a new skill

1. **(this skill)** Confirm no existing skill covers the topic. Define scope, name (kebab-case, prefix `vue-ssr-` if project-scoped), and the discriminating description.
2. **(this skill)** Plan the `SKILL.md` structure and `references/` split.
3. **➜ See skill: skill-creator — drives the draft, test prompts, eval iteration.**
4. **(this skill)** Run `scripts/audit.py` and the manual checklist.
5. **(this skill)** Append the skill to the Skills index in `CLAUDE.md`.
6. **(this skill)** If twin skills, add "Division of responsibilities" table in both.

### Modify `CLAUDE.md`

1. Confirm the change is a **hard rule** (operational, project-wide, non-negotiable).
2. Edit with smallest surface; preserve section structure.
3. Re-run `scripts/audit.py` — enforces 10 KB budget and cross-refs.

### Add a sub-agent

1. Read [references/agent-anatomy.md](./references/agent-anatomy.md).
2. Create `.claude/agents/<name>.md` with frontmatter (`name`, `description`, `tools`, optional `model`).
3. Add a row to `## Agents directory` in `CLAUDE.md`.
4. Run `scripts/audit.py`.

### Add or modify a rule

1. Read [references/rules-anatomy.md](./references/rules-anatomy.md).
2. Confirm content is a constraint (not knowledge). If > 2 KB, it should be a skill.
3. Create `.claude/rules/<descriptive-name>.md` with `paths:` frontmatter.
4. Run `scripts/audit.py`.

## Where to look (routing table)

| If you need…                                     | Read                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| Why `CLAUDE.md` is so terse / what belongs there | [references/claude-md-anatomy.md](./references/claude-md-anatomy.md) |
| How to write a discriminating description        | [references/skill-anatomy.md](./references/skill-anatomy.md)         |
| How to choose `tools` / `model` for an agent     | [references/agent-anatomy.md](./references/agent-anatomy.md)         |
| When to use rules vs skills / rule anatomy       | [references/rules-anatomy.md](./references/rules-anatomy.md)         |
| Hook events and current project status           | [references/hooks-reference.md](./references/hooks-reference.md)     |
| Full audit checklist (auto + manual)             | [references/audit-checklist.md](./references/audit-checklist.md)     |
| Known anti-patterns and corrections              | [references/antipatterns.md](./references/antipatterns.md)           |
| Anthropic official documentation                 | [references/official-links.md](./references/official-links.md)       |
