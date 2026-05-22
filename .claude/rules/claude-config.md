---
paths:
  - '.claude/**/*.md'
  - 'CLAUDE.md'
---

# Claude configuration constraints

When modifying Claude configuration files:

- English only — no French or other languages in skills, agents, rules, or CLAUDE.md
- No code comments (`//`, `/* */`, `<!--`) outside fenced code blocks
- Skills MUST have frontmatter with `name` (matching folder) and `description` (≥80 chars, ≤1024 chars, with anti-triggers)
- Agents MUST have frontmatter with `name`, `description`, and `tools`
- Rules MUST have `paths:` frontmatter with non-empty globs (unless truly global)
- After changes, run: `python3 .claude/skills/claude-anthropic/scripts/audit.py`
- Never silently rewrite skills/agents — propose corrections to the user
