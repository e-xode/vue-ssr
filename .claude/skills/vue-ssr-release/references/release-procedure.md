# Release procedure — step by step

Contents: [Roles](#roles) · [Steps 1-14](#steps) · [Bump rule](#bump-rule) · [Hand-off message](#hand-off-message) · [Edge cases](#edge-cases)

Hard constraints and the continuous `[Unreleased]` update live in the parent `vue-ssr-release/SKILL.md`; the CHANGELOG format lives in the rule `.claude/rules/changelog.md`. Read both first.

## Roles

| Who | Does |
| --- | --- |
| `release` agent | Steps 1-14, read-only steps directly, every git write only on a relayed approval |
| Orchestrator | Relays each proposal to the owner and the answer back; delegates Step 6 to the `validation` agent |
| Owner | Approves the bump, the CHANGELOG, the commit + merge, the tag |
| Ops session | Deploys after the hand-off. The project agent never deploys and never uses SSH |

The session clone (`~/workspace/e-xode.vue-ssr`) is never switched to another branch or tag. Everything happens in a throw-away worktree or through commands that do not check anything out.

## Steps

### 1. Preflight (read-only)

```bash
git -C ~/workspace/e-xode.vue-ssr fetch origin --tags
git -C ~/workspace/e-xode.vue-ssr log --oneline "$(git -C ~/workspace/e-xode.vue-ssr describe --tags --abbrev=0 origin/master)"..origin/master
gh run list --branch master --limit 5
```

Abort when: `## [Unreleased]` in `origin/master`'s `CHANGELOG.md` is empty or absent and the log shows no changelog-worthy commit ("No unreleased changes found"); or the latest `npm-test` run on `master` is not green (fix first).

### 2. Bump proposal

Compute the new version from `package.json` on `origin/master` with the [Bump rule](#bump-rule) and return it as a proposal. The owner confirms or overrides.

### 3. Worktree

```bash
git -C ~/workspace/e-xode.vue-ssr worktree add ~/worktrees/vue-ssr-release -b release/vX.Y.Z origin/master
```

Every later edit and command runs in `~/worktrees/vue-ssr-release`.

### 4. Version

```bash
npm version X.Y.Z --no-git-tag-version
```

It updates `package.json` and `package-lock.json` together, without installing, committing or tagging. The diff must touch only the `version` fields.

### 5. CHANGELOG

Rename `## [Unreleased]` to `## X.Y.Z`, cross-check it against the Step 1 log, fix the categories to the set of the `changelog` rule, and leave no empty `[Unreleased]` behind. Return the section as a draft; the owner approves, edits or corrects.

### 6. Validation

Offer it; on acceptance the orchestrator has the `validation` agent run `npm ci` then the full battery (`npm run validate`, not `--changed`: the tree is committed-clean, so the changed mode would check nothing) in the worktree. A red result stops the release.

### 7. Commit (on approval)

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "[release/vX.Y.Z] release vX.Y.Z"
```

No trailer, no mention of a non-human contributor.

### 8. Merge (same approval covers push, PR and merge)

```bash
~/workspace/e-xode.ops/infra/fleet-pr.e-xode.dev.sh e-xode.vue-ssr ~/worktrees/vue-ssr-release "release vX.Y.Z"
```

The script pushes the branch, opens the PR, waits for the checks, squash-merges (admin merge: self-approval is impossible on this repo), deletes the branch, fast-forwards the session clone and removes the worktree. Exit 0 means merged and clone at `0 0`. A failed check stops it with the PR open: fix in the worktree, commit, rerun.

### 9. Tag (on approval, in a throw-away worktree)

State before asking: **pushing the tag publishes `X.Y.Z` to npm (irreversible) and builds the GHCR image.**

```bash
git -C ~/workspace/e-xode.vue-ssr fetch origin
git -C ~/workspace/e-xode.vue-ssr worktree add --detach ~/worktrees/vue-ssr-tag origin/master
cd ~/worktrees/vue-ssr-tag
grep '"version"' package.json
git tag -a vX.Y.Z -m "vX.Y.Z"
git cat-file -t vX.Y.Z
git push origin vX.Y.Z
git -C ~/workspace/e-xode.vue-ssr worktree remove ~/worktrees/vue-ssr-tag
```

`package.json` must read `X.Y.Z` and `cat-file -t` must print `tag` (annotated), otherwise stop before the push. Never tag the release branch: the squash-merge changed the SHA. The session clone is not checked out to the tag.

### 10. Pipeline

```bash
gh run list --event push --branch vX.Y.Z
gh run watch <run-id>
```

Both `docker-build` and `npm-publish` must be green. **Red: nothing is sent to ops.** Fix through a normal PR, then release the next patch version from Step 1; a version published to npm is never reused and a tag is never moved.

### 11. GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <file holding the X.Y.Z CHANGELOG section>
```

### 12. GitHub Actions unavailable

If the tag pipeline cannot run (Actions disabled, quota, outage): **stop and tell the owner.** The agent does not build or push the image by hand and never runs `npm publish` (denied in settings). Building and pushing the GHCR image manually is an owner or ops decision; the hand-off waits for it.

### 13. Hand-off to ops

Send the [Hand-off message](#hand-off-message) to the `e-xode.ops` session (cross-session message, else give it to the owner). The release ends here. Canonical chain: `e-xode.ops/.claude/reference/release-handoff.md`.

### 14. Report

```bash
git -C ~/workspace/e-xode.vue-ssr rev-list --left-right --count origin/master...HEAD
git -C ~/workspace/e-xode.vue-ssr worktree list
```

Expected `0 0` and no `vue-ssr-release` or `vue-ssr-tag` worktree left. If the session clone was dirty or off `master`, leave it alone and say why.

## Bump rule

Read the `## [Unreleased]` section:

| Content | Bump |
| --- | --- |
| A removed or incompatible public behaviour a fork cannot absorb without code changes (removed route, changed response shape, raised Node.js major) | major |
| Any ⚠️ entry (action required from a deployment or a fork), or any `### Added` entry | minor |
| Only `Security`, `Fixed`, `Changed`, `Removed`, `Package Updates` without ⚠️ | patch |

When in doubt between two levels, propose the higher one and say why.

## Hand-off message

```
Release hand-off: vue-ssr vX.Y.Z
Tag: vX.Y.Z (annotated) on master <short sha>
Pipeline: docker-build <run URL> green, npm-publish <run URL> green
Image: ghcr.io/e-xode/vue-ssr:X.Y.Z
What changed: <3-6 lines from the CHANGELOG section, ⚠️ entries first>
Nothing deployed.

POST-DEPLOY CHECKS (from .claude/reference/post-deploy-checks.md)
- Env vars: <new or changed names, "required in production: boot throws without it" when so, host file> | none
- Readiness: GET /healthz -> 200 {"status":"ok"}
- Data: <new/changed indexes, TTL, migrations or manual steps and who runs them> | none
- Order: single container, no ordering
- After "deployed", the project agent checks: <public routes it will call> ; production DB access: none, owner reads indexes if listed above
```

## Edge cases

- **Cancel before the merge:** `git -C ~/workspace/e-xode.vue-ssr worktree remove --force ~/worktrees/vue-ssr-release`, delete the local branch, and if a PR is open `gh pr close release/vX.Y.Z --delete-branch`. The session clone was never touched.
- **Cancel after the merge, before the tag:** nothing is published. `master` carries version `X.Y.Z` untagged; the next release starts from it.
- **No existing tag:** use the first commit as the baseline in Step 1.
- **A stale `~/worktrees/vue-ssr-release` exists:** it belongs to an unfinished release. Report it; do not reuse or delete it without the owner's word.
