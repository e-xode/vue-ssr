# Size Budget Table

| File kind             |               Budget | Enforcement                                         | Rationale                                                                                                                       |
| --------------------- | -------------------: | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`           |          under 10.5 KB | hard failure in `.claude/skills/claude-anthropic/scripts/audit.py` | This file loads every turn. It should contain hard rules and indexes, not full project knowledge.                               |
| `*/SKILL.md`          |      under 500 lines | hard failure in `.claude/skills/claude-anthropic/scripts/audit.py` | A skill body should be fast to load and execute. Long examples, rubrics, and tables belong in references.                       |
| `*/references/*.md`   | warn above 300 lines | warning in `.claude/skills/claude-anthropic/scripts/audit.py`      | References can be longer, but large files need a table of contents and clear section names so agents load only what they need.  |
| `*/scripts/*`         | no fixed line budget | reviewed by purpose                                 | Scripts should solve deterministic tasks. Prefer clarity, help text, no third-party dependencies, and safe project-local paths. |
| `*/assets/*`          | no fixed line budget | reviewed by purpose                                 | Assets are loaded only when needed. Keep names descriptive and avoid duplicating generated content.                             |
| `.claude/agents/*.md` | no fixed line budget | keep concise                                        | Agents should route work, define protocols, and point to skills rather than embedding all methodology.                          |

## Practical guidance

- If `SKILL.md` grows because of a table, move the table to `references/`.
- If `SKILL.md` grows because of one repeated procedure, create a script.
- If a reference grows above 300 lines, add a table of contents at the top.
- If `CLAUDE.md` grows, move knowledge into a skill and keep only the hard rule or index entry.
