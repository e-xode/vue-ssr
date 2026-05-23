---
name: skill-creator
description: "Create new skills, modify and improve existing skills, and measure skill performance for the Vue SSR Starter Kit. Use when users want to create a skill from scratch, edit or optimize an existing skill, run evals to test a skill, or optimize a skill's description for better triggering accuracy. ALWAYS load together with the claude-anthropic skill: skill-creator owns the create/eval/iterate workflow, claude-anthropic owns the project rules (naming, placement, frontmatter conventions, anti-triggers, references layout, post-creation audit checklist). Don't use for: project-specific skill conventions, audit of existing skills, or CLAUDE.md/agents/hooks governance (→ claude-anthropic skill)."
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

- **name**: kebab-case, prefix `vue-ssr-` for project-scoped skills
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
- **Budget**: 1,536 characters max (combined description + when_to_use)
- **Min length**: 80 characters
