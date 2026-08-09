---
name: review
description: "Code-review method for the Vue SSR Starter Kit (e-xode/vue-ssr): the severity rubric (🔴🟠🟡🟢ℹ️), the anomaly-type taxonomy (security, bug, regression, perf, i18n, convention, test-gap), the citation doctrine, and the markdown report format the `review` agent uses to grade a branch/PR/diff. Trigger when structuring, grading, or sourcing a code review, or defining what counts as a citable convention. Don't use for: making code changes (→ vue/server/design agents), post-task validation (→ vue-ssr-validation + validation agent), Claude config audit (→ claude-anthropic)."
---

# Review

> Read-only structured code review against project conventions.

This skill is report-only. Never edit files, never stage changes, never commit, never run validation commands.

## Citation doctrine

Every 🔴, 🟠 and 🟡 finding must cite a source: a `CLAUDE.md` hard rule, a path-scoped rule under `.claude/rules/`, a project skill, or an objective security / accessibility / performance / SSR / correctness concern. **If a rule cannot be cited, downgrade the finding to 🟢 or ℹ️.** Never invent a project convention.

Route each changed file to its domain and its citable skills with [references/domain-routing.md](references/domain-routing.md).

## Severity rubric

| Level        | Meaning                                    | Action                |
| ------------ | ------------------------------------------ | --------------------- |
| 🔴 Critique  | Bug, security issue, data loss risk        | Must fix before merge |
| 🟠 Important | Convention violation, potential regression | Should fix            |
| 🟡 Medium    | Suboptimal pattern, missing edge case      | Consider fixing       |
| 🟢 Minor     | Style, naming, minor improvement           | Optional              |
| ℹ️ Info      | Observation, question, suggestion          | No action required    |

## Anomaly types

security, bug, regression, perf, a11y, i18n, convention, test-gap, docs-gap, typo

## Procedure

1. **Confirm scope** — branch diff, PR diff, or uncommitted changes
2. **Inventory the diff** — `git diff --stat`, `--name-only`, full content
3. **Review against conventions** — check CLAUDE.md rules, relevant skills
4. **Classify findings** — severity + anomaly type + file:line + evidence
5. **Output report** — sorted by severity (🔴 → ℹ️), then by file

## Conventions to check

- No code comments — CLAUDE.md hard rule
- SCSS externalized (separate .scss file) — rule `scss-externalized`
- i18n mandatory (no hardcoded text) — rule `i18n-mandatory`
- SCSS variables (no hardcoded colors/spacings) — skill `design-scss`
- ObjectId validation (parseObjectId before queries) — rule `server-scope-guard`
- catch blocks (console.error, never empty) — rule `api-error-handling`
- Composition API only (script setup) — CLAUDE.md hard rule
- Shared factorization (no duplication) — rule `code-quality`

## Output format

```markdown
## Code Review — [scope description]

### 🔴 Critique (N)

- **[file:line]** [anomaly-type] Description. Evidence: `code snippet`.

### 🟠 Important (N)

...

### Summary

| Severity | Count |
| -------- | ----- |
| 🔴       | N     |
| 🟠       | N     |
| 🟡       | N     |
| 🟢       | N     |
| ℹ️       | N     |

**Recommendation:** merge as-is / fix critique+important / request changes
```

## `.claude/` configuration review

When the diff touches `.claude/` files or `CLAUDE.md`, additionally run the config audit and report its findings alongside the code review:

```bash
python3 .claude/skills/claude-anthropic/scripts/audit.py
```

➜ See skill: claude-anthropic — owns the audit method, checklist, and anti-pattern catalog for `.claude/` configuration.

## Hard constraints

- Never modify code
- Never run lint/build/test (the config audit above is read-only and is the sole exception)
- Every finding must cite a source (CLAUDE.md rule, path-scoped rule, skill, or objective concern)
- No subjective taste opinions
