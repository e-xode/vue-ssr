---
name: vue-ssr-release
description: "Release workflow for the Vue SSR Starter Kit (e-xode/vue-ssr): version bumping (patch/minor/major), CHANGELOG generation from git log, release branch creation (release/vX.Y.Z), package-lock sync, commit/push/tag proposal. Also loaded at ordinary task completion — not just on 'release' — for the silent curated CHANGELOG `## [Unreleased]` entry the orchestrator adds after any changelog-worthy change. Trigger on any release request, version bump, changelog update, or when the user says 'release'. Delegates to the release agent. Don't use for: deployment/CI (→ vue-ssr-deployment), code changes (→ vue agent), post-task validation (→ vue-ssr-validation)."
---

# Release workflow — Vue SSR Starter Kit

> Owns the release procedure: branch creation, version bump, CHANGELOG update, and commit/push/tag proposal — executed by the `release` agent. Also owns the continuous `## [Unreleased]` CHANGELOG update fired by CLAUDE.md's Task completion protocol at the end of ordinary tasks (see "Continuous `[Unreleased]` update" below), independent of any actual release.

## What this skill does (and does not)

| In scope                                   | Out of scope                                     |
| ------------------------------------------ | ------------------------------------------------ |
| Detect current branch (main/master)        | Deploying to production (→ `vue-ssr-deployment`) |
| Create release branch `release/vX.Y.Z`     | Writing application code (→ `vue` agent)         |
| Bump `version` in `package.json`           | CI/CD pipeline changes (→ `vue-ssr-deployment`)  |
| Sync `package-lock.json` via `npm install` | Post-task code validation (→ `validation` agent) |
| Gather unreleased changes from git log     |                                                  |
| Format and write CHANGELOG entry           |                                                  |
| Maintain `[Unreleased]` between releases   |                                                  |
| Propose commit, push, and tag              |                                                  |

## Hard constraints

1. **Never auto-commit/push/tag.** Always propose and wait for explicit user confirmation before executing any git write operation.
2. **Commit format:** `[release/vX.Y.Z] release vX.Y.Z`
3. **Co-authored-by trailer** on every commit: `Co-authored-by: <name> <email>` sourced from `git config user.name`/`user.email` — never a placeholder like "AI" or "Assistant"
4. **Tag format:** `vX.Y.Z` (prefixed with `v`)
5. **Branch must be main or master** to start a release. If on another branch, abort and inform the user.

## Commit categories

Used both to classify git log commits during a release and to place a curated entry under the correct `## [Unreleased]` subsection (see "Continuous `[Unreleased]` update" below):

| Category         | Commit patterns                            |
| ---------------- | ------------------------------------------ |
| Breaking Changes | `breaking:`, `BREAKING CHANGE`, major bump |
| New Features     | `feat:`, `feature:`, `add:`                |
| Improvements     | `improve:`, `refactor:`, `perf:`, `chore:` |
| Bug Fixes        | `fix:`, `bugfix:`                          |
| Security         | `security:`, `sec:`                        |

If commits don't follow conventional format, list them as bullet points and let the user categorize.

## Release procedure

The full step-by-step procedure (branch verification through the commit/push/tag proposal), the CHANGELOG format reference, and edge cases live in [references/release-procedure.md](./references/release-procedure.md) — read it before executing a release.

## Continuous `[Unreleased]` update (between releases)

Triggered by the **Task completion protocol** in `CLAUDE.md` (step 5), not by a release. The orchestrator does this inline and silently — no version bump, no commit, no tag, no user prompt.

**When to add an entry (curated):** the task produced a user-facing feature, bug fix, behavior/UI/i18n change, or a **product/runtime** dependency change. **Skip** pure reformatting, lockfile-only, test-only, internal-docs, and anything whose **sole purpose is the Claude config** — `.claude/` files **and** `package.json` deps/scripts added only for `.claude/` tooling (judge by purpose, not file path; e.g. a `playwright` devDependency + `screenshots` script that exist only for the `visual-qa` agent are NOT logged). See the `CHANGELOG.md` path rule `.claude/rules/changelog.md`.

**How:**

1. Derive the entry from the diff of the just-completed task — what changed, and why it matters to a user of the kit. One bullet = one theme; ignore reformatting noise.
2. Ensure a `## [Unreleased]` section exists at the top of `CHANGELOG.md`, directly under `# Changelog`. Create it if absent.
3. Place each bullet under the matching category: `Package Updates`, `New Features`, `Improvements`, `Bug Fixes`, `Removed` (`Security` if relevant). Create a category subsection only when needed.
4. **Deduplicate and merge** into existing `[Unreleased]` bullets under the same category — never add a second `[Unreleased]` section and never restate an existing bullet.

**Constraints:** never bump the `package.json` version, never `git commit`/`tag`, no dates. The section stays `[Unreleased]` until a release converts it (see Step 9 in [references/release-procedure.md](./references/release-procedure.md)).
