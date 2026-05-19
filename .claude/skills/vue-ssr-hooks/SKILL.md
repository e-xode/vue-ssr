---
name: vue-ssr-hooks
description: "Post-task validation system for the Vue SSR Starter Kit: the hooks agent runs a format → lint → test battery after every code-modifying task. Covers the short-circuit table (skip validation for non-code files), hook scripts (.claude/hooks/scripts/), guard scripts (subagent validation blocker), change detection via git digest sentinel, and the settings._json configuration. Trigger on: validation failures, hook script issues, understanding why lint/test ran or didn't run, modifying the validation pipeline. Don't use for: app code architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), deployment (→ vue-ssr-deployment), Claude config governance (→ claude-anthropic)."
---

# Vue SSR Hooks (Validation System)

> Owns the post-task validation pipeline: format → lint → test.

## Validation battery

Commands run in order (stop at first failure):

```bash
npx prettier --write .        # format
npm run lint                   # eslint fix
npm run test:run               # vitest single run
```

## Short-circuit table

| Files modified | format | lint | test |
| --- | --- | --- | --- |
| `.vue`, `.js` | ✅ | ✅ | ✅ |
| `.scss`, `.css` only | ✅ | ✅ | ❌ skip |
| `.md`, `.json`, config only | ❌ skip all | ❌ | ❌ |

## Hook scripts

All scripts live in `.claude/hooks/`:

| Script | Purpose |
| --- | --- |
| `logs/logs.sh` | Logging infrastructure (timestamped entries) |
| `guards/changes/changes.sh` | Git digest sentinel (skip if no changes) |
| `guards/subagents/subagents.sh` | Block validation commands in sub-agent prompts |
| `scripts/lint/lint.sh` | Run eslint, report pass/fail |
| `scripts/test/test.sh` | Run vitest, report pass/fail |
| `scripts/format/format.sh` | Run prettier, report pass/fail |

## Settings

`.claude/settings._json` contains the hook configuration (disabled via `._json` extension). When activated, move content to `.claude/settings.json`.

## The `hooks` agent

The `hooks` agent (model: haiku, tools: Bash) is the sole validation executor. The orchestrator delegates to it per the Task completion protocol in CLAUDE.md.

## Guard: subagents

The `subagents.sh` guard blocks sub-agent prompts containing forbidden validation commands (`npm test`, `npm run lint`, `npm run build`). This enforces the centralized-validation rule.

## Change detection

`changes.sh` computes a git digest (status + diff + untracked files → SHA). If the digest matches the last run's sentinel, validation is skipped (idempotent).
