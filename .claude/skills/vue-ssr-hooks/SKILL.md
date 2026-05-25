---
name: vue-ssr-hooks
description: "Post-task validation system for the Vue SSR Starter Kit: the hooks agent runs a format → lint → build → test battery after every code-modifying task. Covers the short-circuit table (skip validation for non-code files, build only on .vue/.js), hook scripts (.claude/hooks/scripts/), guard scripts (subagent validation blocker), change detection via git digest sentinel, and the settings._json configuration. Trigger on: validation failures, hook script issues, understanding why lint/build/test ran or didn't run, modifying the validation pipeline. Don't use for: app code architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), deployment (→ vue-ssr-deployment), Claude config governance (→ claude-anthropic)."
---

# Vue SSR Hooks (Validation System)

> Owns the post-task validation pipeline: format → lint → build → test.

## Validation battery

Commands run in order (stop at first failure):

```bash
npx prettier --write .        # format
npm run lint                   # eslint fix
npm run build                  # vite client + server SSR bundles
npm run test:run               # vitest single run
```

The `build` step compiles both SSR bundles (`build:client` + `build:server`). It catches import errors, server/client boundary leaks, and SSR-incompatible code that lint and unit tests miss — the highest-value guard for an SSR project. It is the slow step, so it is short-circuited to code changes only.

## Short-circuit table

| Files modified              | format      | lint | build   | test    |
| --------------------------- | ----------- | ---- | ------- | ------- |
| `.vue`, `.js`               | ✅          | ✅   | ✅      | ✅      |
| `.scss`, `.css` only        | ✅          | ✅   | ❌ skip | ❌ skip |
| `.md`, `.json`, config only | ❌ skip all | ❌   | ❌      | ❌      |

## Hook scripts

All scripts live in `.claude/hooks/`:

| Script                          | Purpose                                        |
| ------------------------------- | ---------------------------------------------- |
| `logs/logs.sh`                  | Logging infrastructure (timestamped entries)   |
| `guards/changes/changes.sh`     | Git digest sentinel (skip if no changes)       |
| `guards/subagents/subagents.sh` | Block validation commands in sub-agent prompts |
| `scripts/lint/lint.sh`          | Run eslint, report pass/fail                   |
| `scripts/build/build.sh`        | Run vite client + server build, report pass/fail |
| `scripts/test/test.sh`          | Run vitest, report pass/fail                   |
| `scripts/format/format.sh`      | Run prettier, report pass/fail                 |

## Settings

`.claude/settings._json` contains the hook configuration (disabled via `._json` extension). When activated, move content to `.claude/settings.json`.

## Architecture decision: why hooks are disabled

The shell hooks (settings.\_json) are disabled due to a known Copilot bug that causes unreliable hook execution. The workaround is the `hooks` agent — the orchestrator delegates validation to it manually per the Task completion protocol in CLAUDE.md.

**Do NOT re-enable** by renaming to `settings.json` until the Copilot bug is confirmed fixed.

Two-path architecture:

- **Current (active)**: Orchestrator → delegates to `hooks` agent → agent runs format/lint/test
- **Future (when bug fixed)**: Stop event → shell scripts run automatically → no agent needed

## The `hooks` agent

The `hooks` agent (model: haiku, tools: Bash) is the sole validation executor. The orchestrator delegates to it per the Task completion protocol in CLAUDE.md.

## Guard: subagents

The `subagents.sh` guard blocks sub-agent prompts containing forbidden validation commands (`npm test`, `npm run lint`, `npm run build`). This enforces the centralized-validation rule.

## Change detection

`changes.sh` computes a git digest (status + diff + untracked files → SHA). If the digest matches the last run's sentinel, validation is skipped (idempotent).
