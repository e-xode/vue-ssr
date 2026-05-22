# Rules anatomy (`.claude/rules/`)

## What rules are

Rules are lightweight, path-scoped instruction files that load automatically when Claude works on files matching their glob pattern.

## Loading behaviour

- Rules **with** `paths:` frontmatter load ONLY when Claude reads or edits matching files.
- Rules **without** `paths:` load unconditionally (same cost as CLAUDE.md).
- Multiple rules can load simultaneously.

## File format

```yaml
---
paths:
  - 'src/api/**/*.js'
---
# Title

Instruction text. Short, imperative, guardrail-style.
```

## When to use rules vs skills vs CLAUDE.md

| Criterion | `.claude/rules/` | `.claude/skills/` | `CLAUDE.md` |
| --- | --- | --- | --- |
| **Content** | Guardrails, hard DON'Ts | Knowledge, procedures | Global hard rules |
| **Loading** | Deterministic by path (100%) | Semantic matching (may miss) | Every turn |
| **Size** | Short (< 2 KB) | Rich (up to 50 KB) | Minimal (< 10 KB) |
| **Use when** | Constraint on specific files | Teaching domain knowledge | Rule on every turn |

### Decision flowchart

1. Needed on **every turn**? → `CLAUDE.md`
2. Tied to **specific file path**? → Rule
3. Needs **more than ~20 lines**? → Skill
4. Is a **constraint** (not knowledge)? → Rule
5. Needs **examples or procedures**? → Skill

## Project conventions

- `kebab-case.md` filenames
- Imperative voice
- English only
- Concise (< 2 KB)
- Flat directory (no subdirectories in `.claude/rules/`)

## Current inventory

| Rule file | `paths:` | Purpose |
| --- | --- | --- |
| `testing-conventions.md` | `tests/**/*.test.js`, `src/**/*.test.js` | Vitest + happy-dom patterns |
| `i18n-mandatory.md` | `src/views/**/*.vue`, `src/components/**/*.vue` | No hardcoded text |
| `scss-externalized.md` | `src/views/**/*.vue`, `src/components/**/*.vue` | Separate .scss files |
| `api-error-handling.md` | `src/api/**/*.js` | try/catch + parseObjectId + rate limiters |
