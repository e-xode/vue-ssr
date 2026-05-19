# Audit checklist

Run the script before manual review:

```bash
python3 .claude/skills/claude-anthropic/scripts/audit.py
```

## `CLAUDE.md`

- `[AUTO]` File size ≤ 10 KB.
- `[AUTO]` No `//` or `/* */` comments outside fenced code blocks.
- `[MANUAL]` Every section is a **hard rule**, not a best practice or tutorial.
- `[MANUAL]` Each agent in `## Agents directory` has a discriminating one-line trigger.
- `[MANUAL]` Each skill in `## Skills index` has a discriminating one-line trigger column.
- `[MANUAL]` No section duplicates content available in a skill.

## Skills (each `SKILL.md`)

- `[AUTO]` Valid YAML frontmatter with `name` and `description`.
- `[AUTO]` `name` in frontmatter matches the folder name.
- `[AUTO]` `description` ≥ 80 characters.
- `[AUTO]` `description` contains an anti-trigger clause.
- `[AUTO]` Skill name is unique across `.claude/skills/`.
- `[AUTO]` `SKILL.md` ≤ 50 KB.
- `[AUTO]` All relative links resolve to existing files.
- `[AUTO]` No `//` comments outside fenced code blocks.
- `[MANUAL]` Description is **discriminating** — cannot match another skill equally.
- `[MANUAL]` Description is **pushy** — encourages triggering.
- `[MANUAL]` Anti-triggers point to **correct alternative**.
- `[MANUAL]` `SKILL.md` is method + index, not encyclopedia.
- `[MANUAL]` Twin skills have matching "Division of responsibilities" table.

## Agents (each `.claude/agents/<name>.md`)

- `[AUTO]` Frontmatter has `name`, `description`, `tools`.
- `[AUTO]` Agent is listed in `## Agents directory` of `CLAUDE.md` (and vice versa).
- `[MANUAL]` `tools` is the minimum required.
- `[MANUAL]` Body restates the sub-agent contract.

## Rules (`.claude/rules/*.md`)

- `[AUTO]` Rule file size ≤ 2 KB.
- `[AUTO]` If `paths:` present, contains non-empty glob.
- `[AUTO]` No `//` comments outside fenced code blocks.
- `[AUTO]` English-only heuristic.
- `[MANUAL]` Content is a constraint, not knowledge.
- `[MANUAL]` Does not duplicate a skill's body.

## Cross-cutting

- `[AUTO]` No skill folder lacks a `SKILL.md`.
- `[AUTO]` English-only heuristic on all skills/references.
- `[AUTO]` No scripts in `.claude/scripts/` global pool.
- `[MANUAL]` No two skills overlap without disambiguation.
- `[MANUAL]` Skills index in `CLAUDE.md` reflects reality.

## After making changes

1. Run `python3 .claude/skills/claude-anthropic/scripts/audit.py`. Exit code must be 0.
2. Resolve any new WARN.
3. Propose corrections to the user. **Never auto-apply.**
