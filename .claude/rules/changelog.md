---
paths:
  - CHANGELOG.md
---

# Changelog scope and format

This rule is the single source for the CHANGELOG format; the `release` agent and the `vue-ssr-release` skill point here.

- Entries go under the `## [Unreleased]` section at the top of the file, directly under `# Changelog`. Create it if absent; never add a second one.
- Categories, in this order, each created only when it has an entry: `### Security`, `### Added`, `### Changed`, `### Fixed`, `### Removed`, `### Package Updates`. No other category name.
- One bullet per change, starting with a bold summary, written for a user of the kit (what changed and why it matters), not as a commit log. Merge into an existing bullet rather than restating it.
- Mark with ⚠️ every change that requires action from a deployment or a fork (new required env var, boot refusal, renamed script, removed export, data deleted or migrated).
- A released section is `## X.Y.Z`: no `v`, no date, no `---` separator between versions.
- Never bump the version number or create a commit as part of a changelog edit — that is the `release` agent's job.

What counts as changelog-worthy is decided by CLAUDE.md's Task completion protocol §2: product-facing changes only (feature, bug fix, behavior/UI/i18n, product/runtime dependency) — never `.claude/` agents/skills/rules/settings, Claude-tooling-only `package.json` entries, reformatting, lockfile-only, test-only, or internal-docs changes. This rule covers where and how the entry is written, not whether one is warranted.
