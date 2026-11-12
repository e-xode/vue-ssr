---
name: vue-ssr-release
description: "Release workflow for the Vue SSR Starter Kit (e-xode/vue-ssr): 14 steps in a throw-away git worktree, from preflight and bump proposal (patch/minor/major rule) through CHANGELOG conversion, the fleet PR script, the annotated tag (which publishes to npm and GHCR), the pipeline check and the hand-off message to ops. Also loaded at ordinary task completion — not just on 'release' — for the silent curated CHANGELOG `## [Unreleased]` entry the orchestrator adds after any changelog-worthy change. Trigger on any release request, version bump, changelog update, or when the user says 'release'. Delegates to the release agent. Don't use for: deployment/CI (→ vue-ssr-deployment), code changes (→ vue agent), post-task validation (→ vue-ssr-validation)."
---

# Release workflow — Vue SSR Starter Kit

> Owns the release procedure, executed by the `release` agent, and the continuous `## [Unreleased]` CHANGELOG update fired by CLAUDE.md's Task completion protocol at the end of ordinary tasks (see "Continuous `[Unreleased]` update" below), independent of any actual release.

## What a release is

`merge → annotated tag → green pipeline → hand-off to ops`. Pushing the tag `vX.Y.Z` triggers two workflows: `npm-publish.yml` (publishes `@e-xode/vue-ssr@X.Y.Z` to npm, **irreversible**) and `docker-build.yml` (pushes the GHCR image). The release ends at the hand-off message; production is deployed by the ops session, never by this repo's agents.

| In scope | Out of scope |
| --- | --- |
| Preflight on `origin/master` (changes, green CI) | Deploying to production, SSH to a host (→ the ops session) |
| Bump proposal from the bump rule | Writing application code (→ `vue`/`server` agents) |
| Worktree `~/worktrees/vue-ssr-release`, branch `release/vX.Y.Z` | CI/CD pipeline changes (→ `vue-ssr-deployment`) |
| `npm version X.Y.Z --no-git-tag-version` | Running validation itself (→ `validation` agent, full battery) |
| `[Unreleased]` → `## X.Y.Z` | `npm publish` or a manual image push (never; the tag pipeline does it) |
| Commit, fleet PR script, annotated tag: proposed, run on approval | |
| Pipeline check, GitHub Release, hand-off message with POST-DEPLOY CHECKS | |

## Hard constraints

1. **Commit gate:** no commit, push, merge, tag or history rewrite on your own initiative. They are allowed when the user asks for them in the current turn, or after you asked and they agreed.
2. **Worktree only (clone alignment, 2026-11-03):** the release runs in `~/worktrees/vue-ssr-release` created from `origin/master`, the tag in `~/worktrees/vue-ssr-tag`; the session clone is never switched to another branch or tag. No local-only commit survives the operation. At the end the clone reads `git rev-list --left-right --count origin/master...HEAD` = `0 0` (the fleet PR script fast-forwards it when it is clean and on `master`; otherwise leave it alone and say why).
3. **One route to `master`:** `~/workspace/e-xode.ops/infra/fleet-pr.e-xode.dev.sh` (push, PR, checks, squash merge, realign). No raw `git push` of `master`, no hand-rolled `gh pr merge`.
4. **Commit format:** `[release/vX.Y.Z] release vX.Y.Z`. **No `Co-authored-by` trailer, ever** — no trailer and no mention of a non-human contributor on any commit; the author is the user's own git account.
5. **Tag:** `vX.Y.Z`, **annotated** (`git tag -a`, verified with `git cat-file -t` = `tag`), created on `origin/master` only after the merge is confirmed and `package.json` there reads `X.Y.Z`. Never on the release branch, never moved, never reused.
6. **The tag is the publication:** say so before asking for the tag approval. A red pipeline is fixed by a new patch release, and nothing is handed to ops.
7. **GitHub Actions unavailable:** stop and tell the owner. No manual image push or publish by the agent.
8. **Never deploy, never SSH to a host.** The hand-off message carries the POST-DEPLOY CHECKS block built from `.claude/reference/post-deploy-checks.md`.
9. **CHANGELOG format:** the rule `.claude/rules/changelog.md` is the single source (categories, order, ⚠️, no date, no separator).

## Release procedure

The 14 numbered steps, the bump rule, the hand-off message template and the edge cases are in [references/release-procedure.md](./references/release-procedure.md) — read it before executing a release, and follow the steps in order.

| # | Step | Needs approval |
| --- | --- | --- |
| 1 | Preflight: fetch, unreleased changes exist, `master` CI green | |
| 2 | Bump proposal | bump |
| 3 | Worktree + `release/vX.Y.Z` | |
| 4 | `npm version X.Y.Z --no-git-tag-version` | |
| 5 | CHANGELOG conversion, draft returned | changelog |
| 6 | Full validation offered (`validation` agent) | opt-in |
| 7 | Commit | commit + merge |
| 8 | Fleet PR script: push, PR, checks, squash merge, realign | (covered by 7) |
| 9 | Annotated tag in a throw-away worktree | tag |
| 10 | Watch `docker-build` and `npm-publish` | |
| 11 | GitHub Release from the CHANGELOG section | |
| 12 | Actions unavailable → stop, tell the owner | |
| 13 | Hand-off message to ops | |
| 14 | Report `0 0`, no worktree left | |

## Continuous `[Unreleased]` update (between releases)

Triggered by the **Task completion protocol** in `CLAUDE.md` (step 2), not by a release. The orchestrator does this inline and silently — no version bump, no commit, no tag, no user prompt.

**When to add an entry (curated):** the task produced a user-facing feature, bug fix, behavior/UI/i18n change, or a **product/runtime** dependency change. **Skip** pure reformatting, lockfile-only, test-only, internal-docs, and anything whose **sole purpose is the Claude config** — `.claude/` files **and** `package.json` deps/scripts added only for `.claude/` tooling (judge by purpose, not file path; e.g. a `playwright` devDependency + `screenshots` script that exist only for the `visual-qa` agent are NOT logged). See the `CHANGELOG.md` path rule `.claude/rules/changelog.md`.

**How:**

1. Derive the entry from the diff of the just-completed task — what changed, and why it matters to a user of the kit. One bullet = one theme; ignore reformatting noise.
2. Ensure a `## [Unreleased]` section exists at the top of `CHANGELOG.md`, directly under `# Changelog`. Create it if absent.
3. Place each bullet under the matching category, using the names, order and ⚠️ convention of the rule `.claude/rules/changelog.md` (it loads with `CHANGELOG.md`).
4. **Deduplicate and merge** into existing `[Unreleased]` bullets under the same category — never add a second `[Unreleased]` section and never restate an existing bullet.

**Constraints:** never bump the `package.json` version, never `git commit`/`tag`, no dates. The section stays `[Unreleased]` until a release converts it (Step 5 in [references/release-procedure.md](./references/release-procedure.md)).
