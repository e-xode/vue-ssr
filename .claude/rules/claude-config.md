---
paths:
  - '.claude/**/*.md'
  - '.claude/**/*.json'
  - 'CLAUDE.md'
---

# Claude configuration constraints

When modifying Claude configuration files (CLAUDE.md, skills, agents, rules):

- English only — no French or other languages in skills, agents, rules, or CLAUDE.md.
- No code comments (`//`, `/* */`, `<!--`) outside fenced code blocks.
- Frontmatter requirements, size/budget caps (CLAUDE.md, rules, skill/agent descriptions), and the always-loaded total are governed by the `governance` skill and enforced by `audit.py` — that script is the single source of truth, not a restated list here.
- Scripts belong to their owning skill (`.claude/skills/<owner>/scripts/`), never to a global `.claude/scripts/` pool.
- One native hook runs here (`SessionStart`, audit measurement — observation only, measured 2026-09-20); amended 2026-09-20, this line read "the project runs zero native hooks". Observation hooks are allowed, hooks that lengthen the work loop are not; introducing another is an architecture decision requiring explicit user approval.
- After changes, run: `deadweight --fresh` and resolve every ERROR.
- Never silently rewrite a skill or agent — propose corrections to the user (governance doctrine in `governance`).
