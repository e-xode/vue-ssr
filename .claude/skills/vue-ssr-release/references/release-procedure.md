# Release procedure — step by step

Full step-by-step release procedure for the Vue SSR Starter Kit. Hard constraints, the commit-category table, and the in/out-of-scope routing table live in the parent `vue-ssr-release/SKILL.md` — read that first.

## Step 1 — Verify branch

```bash
git branch --show-current
```

Must be `main` or `master`. If not, abort: "You must be on main/master to start a release."

## Step 2 — Ensure clean working tree

```bash
git status --porcelain
```

If dirty, abort: "Working tree is not clean. Please commit or stash your changes first."

## Step 3 — Ask bump type

Ask the user: **patch**, **minor**, or **major**.

Compute new version from current `package.json` version:

- `patch`: 3.0.2 → 3.0.3
- `minor`: 3.0.2 → 3.1.0
- `major`: 3.0.2 → 4.0.0

## Step 4 — Create release branch

```bash
git checkout -b release/vX.Y.Z
```

## Step 5 — Bump version in package.json

Edit `package.json` → update `"version": "X.Y.Z"`.

## Step 6 — Sync lockfile

```bash
npm install
```

This updates `package-lock.json` to match the new version.

## Step 7 — Gather unreleased changes

If a `## [Unreleased]` section already exists in `CHANGELOG.md` (maintained continuously — see the "Continuous `[Unreleased]` update" section in `SKILL.md`), use it as the primary source and only cross-check git log for anything missed. Otherwise gather from git log:

```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

Parse commit messages and group them using the commit-category table in `SKILL.md`. If commits don't follow conventional format, list them as bullet points and let the user categorize.

## Step 8 — Present CHANGELOG draft

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

## Step 9 — Write CHANGELOG

If a `## [Unreleased]` section exists, rename its header to `## X.Y.Z` (merging any additions from Steps 7–8). Otherwise insert the approved `## X.Y.Z` section at the top of `CHANGELOG.md`, below `# Changelog` and any blank line, above the first existing `## X.Y.Z` entry. Either way, leave no empty `[Unreleased]` section behind.

## Step 10 — Propose commit

Present the exact command to the user:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "[release/vX.Y.Z] release vX.Y.Z"
```

**Wait for user confirmation** before executing.

## Step 11 — Propose push + PR + merge

Present:

```bash
git push -u origin release/vX.Y.Z
gh pr create --base master --head release/vX.Y.Z --title "release vX.Y.Z" --body "..."
gh pr merge --admin --squash --delete-branch
```

**Wait for user confirmation** before executing each operation. This repo requires 1 approving
review to land on `master`; self-approval is forbidden, so `--admin` is required to merge your own
release PR. `--squash` matches the repo's merge-method restriction (squash/rebase only) and keeps
history linear.

## Step 12 — Verify the merge, then tag

**Tag only after the release branch has merged into `master` — never on the still-unmerged release
branch.** A squash-merge rewrites the SHA, so the commit you just pushed on `release/vX.Y.Z` is
never the one that ends up on `master`; tagging it there would tag a commit `master` doesn't
contain.

Once the merge from Step 11 is confirmed, re-fetch and check that `master`'s HEAD actually reflects
it before tagging:

```bash
git checkout master
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

**Wait for user confirmation** before executing.

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
- An `## [Unreleased]` section may sit at the very top between releases; it uses the same category structure and is converted to `## X.Y.Z` at release time (Step 9)

## Edge cases

- **No commits since last tag:** Abort with "No unreleased changes found."
- **No existing tags:** Use first commit as baseline: `git log --oneline --all`
- **User cancels at any step:** Offer to delete the release branch: `git checkout master && git branch -D release/vX.Y.Z`. If a PR was already opened (Step 11) but not yet merged, also offer `gh pr close release/vX.Y.Z --delete-branch`.
