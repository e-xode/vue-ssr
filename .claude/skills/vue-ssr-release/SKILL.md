---
name: vue-ssr-release
description: "Release workflow for the Vue SSR Starter Kit (e-xode/vue-ssr): version bumping (patch/minor/major), CHANGELOG generation from git log, release branch creation (release/vX.Y.Z), package-lock sync, commit/push/tag proposal. Trigger on any release request, version bump, changelog update, or when the user says 'release'. Delegates to the release agent. Don't use for: deployment/CI (→ vue-ssr-deployment), code changes (→ vue agent), post-task validation (→ vue-ssr-hooks)."
---

# Release workflow — Vue SSR Starter Kit

> Owns the release procedure: branch creation, version bump, CHANGELOG update, and commit/push/tag proposal. The `release` agent executes this workflow.

## What this skill does (and does not)

| In scope | Out of scope |
| --- | --- |
| Detect current branch (main/master) | Deploying to production (→ `vue-ssr-deployment`) |
| Create release branch `release/vX.Y.Z` | Writing application code (→ `vue` agent) |
| Bump `version` in `package.json` | CI/CD pipeline changes (→ `vue-ssr-deployment`) |
| Sync `package-lock.json` via `npm install` | Post-task code validation (→ `hooks` agent) |
| Gather unreleased changes from git log | |
| Format and write CHANGELOG entry | |
| Propose commit, push, and tag | |

## Hard constraints

1. **Never auto-commit/push/tag.** Always propose and wait for explicit user confirmation before executing any git write operation.
2. **Commit format:** `[release/vX.Y.Z] release vX.Y.Z`
3. **Co-authored-by trailer** on every commit: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
4. **Tag format:** `vX.Y.Z` (prefixed with `v`)
5. **Branch must be main or master** to start a release. If on another branch, abort and inform the user.

## Release procedure (step by step)

### Step 1 — Verify branch

```bash
git branch --show-current
```

Must be `main` or `master`. If not, abort: "You must be on main/master to start a release."

### Step 2 — Ensure clean working tree

```bash
git status --porcelain
```

If dirty, abort: "Working tree is not clean. Please commit or stash your changes first."

### Step 3 — Ask bump type

Ask the user: **patch**, **minor**, or **major**.

Compute new version from current `package.json` version:
- `patch`: 3.0.2 → 3.0.3
- `minor`: 3.0.2 → 3.1.0
- `major`: 3.0.2 → 4.0.0

### Step 4 — Create release branch

```bash
git checkout -b release/vX.Y.Z
```

### Step 5 — Bump version in package.json

Edit `package.json` → update `"version": "X.Y.Z"`.

### Step 6 — Sync lockfile

```bash
npm install
```

This updates `package-lock.json` to match the new version.

### Step 7 — Gather unreleased changes

```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

Parse commit messages. Group them into categories:

| Category | Commit patterns |
| --- | --- |
| Breaking Changes | `breaking:`, `BREAKING CHANGE`, major bump |
| New Features | `feat:`, `feature:`, `add:` |
| Improvements | `improve:`, `refactor:`, `perf:`, `chore:` |
| Bug Fixes | `fix:`, `bugfix:` |
| Security | `security:`, `sec:` |

If commits don't follow conventional format, list them as bullet points and let the user categorize.

### Step 8 — Present CHANGELOG draft

Show the user the formatted CHANGELOG section:

```markdown
## X.Y.Z

### New Features
- Description of feature

### Improvements
- Description of improvement

### Bug Fixes
- Description of fix
```

Ask the user to **approve**, **edit**, or **provide corrections**.

### Step 9 — Write CHANGELOG

Insert the approved section at the top of `CHANGELOG.md`, below `# Changelog` and any blank line, above the first existing `## X.Y.Z` entry.

### Step 10 — Propose commit

Present the exact command to the user:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "[release/vX.Y.Z] release vX.Y.Z

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

**Wait for user confirmation** before executing.

### Step 11 — Propose push + tag

Present:

```bash
git push -u origin release/vX.Y.Z
git tag vX.Y.Z
git push origin vX.Y.Z
```

**Wait for user confirmation** before executing each operation.

## CHANGELOG format reference

Match the existing project style:

```markdown
# Changelog

## X.Y.Z

### New Features
- **component/scope** — Description of the change

### Improvements
- Description

### Bug Fixes
- Description

---

## previous version...
```

- Use `---` separator between versions
- Use `###` for categories
- Use `- ` bullet points with optional `**scope**` prefix
- No date in header (project convention — dates are in older entries but dropped from v3.0.0+)

## Edge cases

- **No commits since last tag:** Abort with "No unreleased changes found."
- **No existing tags:** Use first commit as baseline: `git log --oneline --all`
- **User cancels at any step:** Offer to delete the release branch: `git checkout master && git branch -D release/vX.Y.Z`
