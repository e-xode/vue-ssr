---
paths:
  - CHANGELOG.md
---

# Changelog scope

Entries go under the `## [Unreleased]` section at the top of the file, one line per change, grouped under `### Added`/`### Changed`/`### Fixed`/`### Security` as applicable. Never bump the version number or create a commit as part of a changelog edit — that is the `release` agent's job.

What counts as changelog-worthy is decided by CLAUDE.md's Task completion protocol §2: product-facing changes only (feature, bug fix, behavior/UI/i18n, product/runtime dependency) — never `.claude/` agents/skills/rules/settings, Claude-tooling-only `package.json` entries, reformatting, lockfile-only, test-only, or internal-docs changes. This rule covers where and how the entry is written, not whether one is warranted.
