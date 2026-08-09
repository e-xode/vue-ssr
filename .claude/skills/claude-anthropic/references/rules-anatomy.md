# Rules anatomy (`.claude/rules/`)

## What rules are

Rules are lightweight, path-scoped instruction files that load **automatically** when Claude works on files matching their glob pattern. They live in `.claude/rules/` and complement skills and `CLAUDE.md`.

## Loading behaviour (official Anthropic, verified 2026-08-09)

Source: [Organize rules with .claude/rules/](https://code.claude.com/docs/en/memory#organize-rules-with-claude-rules). This is a real Claude Code feature, not a project convention — the harness loads these files itself.

- Rules **without** `paths:` frontmatter load unconditionally (same priority as `.claude/CLAUDE.md`).
- Rules **with** `paths:` frontmatter load ONLY when Claude reads or edits files matching the glob.
- Multiple rules can load simultaneously if several globs match the active file.
- Rules are merged alongside `CLAUDE.md` content — they do not override it.
- All `.md` files are discovered **recursively**, so subdirectories (`frontend/`, `backend/`) work. This project keeps the directory flat anyway.
- Symlinks are followed, and `~/.claude/rules/` provides user-level rules that load before (and therefore rank below) project rules.
- A subagent receives the same rule set the main conversation does — rules reach the fleet, unlike the parent's conversation or loaded skills.

Two failure modes to design around:

- **A glob that matches nothing never fires, and nothing warns you.** Verify a new `paths:` entry against the real tree before trusting it. This has already bitten the project once: `paths: 'Dockerfile'` never matched, because the real file is `docker/build/Dockerfile`.
- **Path-scoped rules are not re-injected after `/compact`.** They reload only when Claude next touches a matching file. A constraint that must hold for a whole long session belongs in `CLAUDE.md`.

Glob syntax notes: brace expansion is supported (`src/**/*.{ts,tsx}`), with a whole-list budget of 1,000 expanded patterns; a pattern that would exceed it is used unexpanded and matches nothing. A `[` that cannot be read as a bracket expression makes that one pattern match nothing — escape it as `\[`.

## File format

```yaml
---
paths:
  - 'src/**/*.vue'
---
# Title (optional but recommended)

Instruction text in markdown. Short, imperative, guardrail-style.
```

### Frontmatter fields

| Field   | Required             | Description                                                         |
| ------- | -------------------- | ------------------------------------------------------------------- |
| `paths` | No (but recommended) | YAML list of glob patterns. Without it, rule loads unconditionally. |

No other frontmatter fields are used. Rules are intentionally minimal.

## When to use rules vs skills vs CLAUDE.md

| Criterion        | `.claude/rules/`                                         | `.claude/skills/`                         | `CLAUDE.md`                          |
| ---------------- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| **Content type** | Guardrails, constraints, hard DON'Ts                     | Knowledge, procedures, how-to             | Global hard rules                    |
| **Loading**      | Deterministic by file path (100% hit)                    | Semantic/description matching (may miss)  | Every turn                           |
| **Size**         | Short (< 2 KB recommended)                               | Rich (up to 50 KB + references)           | Minimal (< 10 KB)                    |
| **Structure**    | Flat markdown, no references                             | SKILL.md + references/ + scripts/         | Sections with tables                 |
| **Maintenance**  | Near-zero (set and forget)                               | Active (needs audit, evals)               | Careful (token budget)               |
| **Use when…**    | You need a constraint to fire reliably on specific files | You need to teach Claude domain knowledge | You need a rule on every single turn |

### Decision flowchart

1. Is this needed on **every turn**, regardless of file context? → `CLAUDE.md`
2. Is this tied to a **specific file path or pattern**? → Rule
3. Does it require **more than ~20 lines** to explain? → Skill
4. Is it a **constraint** ("don't do X") rather than knowledge ("here's how to do X")? → Rule
5. Does Claude need **examples, references, or procedures**? → Skill

### Complementary use (rule + skill)

A rule and a skill can cover the same domain at different levels:

- **Rule** = lightweight guardrail that always fires (e.g., "never import server modules from client code")
- **Skill** = deep knowledge loaded on demand (e.g., full SSR architecture and browser API patterns)

The rule prevents mistakes. The skill teaches the right approach.

## Project conventions (Vue SSR Starter Kit)

### Naming

- `kebab-case.md` (e.g., `testing-conventions.md`, `locale-delegation.md`)
- Descriptive — the filename should indicate what the rule guards

### Content style

- **Imperative voice** — "Do X", "Never Y", "Always Z"
- **No code comments** in prose (same rule as skills and CLAUDE.md)
- **English only** (same rule as all persisted artefacts)
- **Concise** — aim for < 2 KB. If growing beyond that, consider a skill instead.

### Placement

All rules live in `.claude/rules/` (flat — no subdirectories).

## Current project inventory (12 rules)

Globs live in each file's `paths:` frontmatter — the authoritative source; this table records intent only.

| Rule file                   | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `api-error-handling.md`     | try/catch shape and ObjectId validation on API handlers   |
| `changelog.md`              | Judge changelog entries by product impact, not path       |
| `claude-config.md`          | Constraints on CLAUDE.md / skills / agents / rules edits  |
| `client-server-boundary.md` | No server-only imports in client code                     |
| `code-quality.md`           | ESLint-enforced size/complexity/constants discipline      |
| `fleet-ops.md`              | Guardrails for fleet-wide dependency/security campaigns   |
| `i18n-mandatory.md`         | No hardcoded user-visible strings in templates            |
| `locale-delegation.md`      | Hard stop — delegate `src/translate/**` to translate      |
| `scss-externalized.md`      | Component styles live in a sibling `.scss` file           |
| `server-scope-guard.md`     | Server-side constraints on `server.js` and `src/api/**`   |
| `server-security.md`        | Security constraints on server entry points               |
| `testing-conventions.md`    | Vitest-only, @vue/test-utils, SSR-safe tests              |

## Anti-patterns (rules-specific)

- **F1.** Rule that duplicates a skill's body (bloats context on every matching file)
- **F2.** Rule without `paths:` that could be a line in `CLAUDE.md` (unconditional rule = same cost)
- **F3.** Rule > 2 KB (should probably be a skill with proper structure)
