---
name: skill-creator
description: "Create new skills, modify and improve existing skills, and measure skill performance for the Vue SSR Starter Kit. Use when users want to create a skill from scratch, edit or optimize an existing skill, run evals to test a skill, or optimize a skill's description for better triggering accuracy. ALWAYS load together with the claude-anthropic skill: skill-creator owns the create/eval/iterate workflow, claude-anthropic owns the project rules (naming, placement, frontmatter conventions, anti-triggers, references layout, post-creation audit checklist). Don't use for: project-specific skill conventions, audit of existing skills, or CLAUDE.md/agents/rules governance (→ claude-anthropic skill)."
---

# Skill Creator

> **Contents:** [Project context](#project-context) · [Creating a skill](#creating-a-skill) · [Running evals](#running-evals) · [Improving](#improving-the-skill) · [Description optimization](#description-optimization)

A skill for creating new skills and iteratively improving them.

## Project context

If the `claude-anthropic` skill is available in this project, **consult it FIRST** for project-specific conventions: skill naming, placement under `.claude/skills/`, frontmatter rules (discriminating description, anti-triggers, domain prefix), `references/` layout, and the post-creation audit checklist (`scripts/audit.py`).

This skill (`skill-creator`) handles the generic create / evaluate / iterate loop. `claude-anthropic` handles the _what / where / why_ for this project.

### Division of responsibilities — `skill-creator` ↔ `claude-anthropic`

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

Handoff convention: `➜ See skill: claude-anthropic — <reason>`.

## Creating a skill

### Capture intent

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases to verify?

### Write the SKILL.md

- **name**: kebab-case, prefixed by domain — `vue-ssr-*` (project-specific), `vue3-*` (Vue 3), `vuetify-*` (Vuetify 4), `design-*` (SCSS/UX/art-direction), `marketing-*` (acquisition); cross-cutting skills (`translate`, `review`, `seo`, `skill-creator`, `claude-anthropic`, `starter-kit-adapt`) stay unprefixed. See `claude-anthropic` rule 14 for the authoritative list.
- **description**: Discriminating, pushy, with anti-triggers. Min 80 chars.
- **body**: Method + index. Knowledge in `references/`.

### Folder layout

```
.claude/skills/<skill-name>/
├── SKILL.md            (required)
├── references/         (optional, for skills > ~200 lines)
│   └── <topic>.md
├── scripts/            (optional, deterministic tooling)
└── evals/              (optional, test cases)
    └── evals.json
```

### Size budgets

Every file kind has a budget and an enforcement point — see [references/size-budget-table.md](references/size-budget-table.md). When a file outgrows its budget, move content down the disclosure chain (CLAUDE.md → skill body → reference → script), never trim the trigger surface.

## Running evals

Create `evals/evals.json` with test prompts and assertions:

```json
{
  "skill_name": "my-skill",
  "evals": [
    {
      "id": 1,
      "name": "test-name",
      "prompt": "User prompt to test",
      "assertions": [{ "text": "Expected behavior or content in response" }]
    }
  ]
}
```

## Improving the skill

1. Run evals, note failures
2. Identify patterns in failures
3. Add missing context/rules to SKILL.md or references
4. Re-run evals until assertions pass
5. Run `scripts/audit.py` to validate structure

## Description optimization

- **Discriminating**: State exact domain, file paths, key types, trigger keywords
- **Pushy**: "Trigger whenever...", "Always load when..."
- **Anti-triggered**: "Don't use for: X (→ alternative-skill)"
- **Budget**: the binding constraint for this project is a 23,000-char AGGREGATE sub-budget across ALL skill descriptions combined (audit-warned) — check the current aggregate total (`scripts/audit.py` INFO output) before adding chars to any description. The 1,536-char single-skill hard cap is a per-skill listing ceiling and rarely the actual limiting factor.
- **Min length**: 80 characters
