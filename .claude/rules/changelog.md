---
paths:
  - CHANGELOG.md
---

# Changelog scope

Decide entries by what touches the **product**, not by which file changed.

**Add an entry** only when the change affects users/consumers of the project: a feature, bug fix, behavior/UI/i18n change, or a **product/runtime dependency** change.

**Skip** anything whose sole purpose is the Claude configuration — `.claude/` agents/skills/rules/hooks **and** `package.json` devDependencies, npm scripts, or config added only to power Claude tooling. Example: a `playwright` devDependency plus a `screenshots` script that exist only for the `visual-qa` agent are Claude tooling, not product — do not log them. Judge by purpose, not by file path.

Also skip: pure reformatting, lockfile-only, test-only, and internal-docs changes. Never bump the version or commit as part of a changelog edit.
