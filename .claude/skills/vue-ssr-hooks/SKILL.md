---
name: vue-ssr-hooks
description: "Post-task validation system for the Vue SSR Starter Kit: the hooks agent runs a format → lint → build → test battery via the single `npm run validate` orchestrator, on user opt-in only. Covers the opt-in trigger (never automatic), the validate.mjs orchestrator (parallel stages, prettier/eslint --cache, git-digest sentinel skip), the short-circuit table (skip validation for non-code files, build only on .vue/.js), the dormant settings._json hooks, and the subagent validation blocker. Trigger on: validation failures, understanding why lint/build/test ran or didn't run, modifying the validation pipeline. Don't use for: app code architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), deployment (→ vue-ssr-deployment), Claude config governance (→ claude-anthropic)."
---

# Vue SSR Hooks (Validation System)

> Owns the post-task validation pipeline: format → lint → build → test, executed by the `hooks` agent via `npm run validate`.

## When validation runs — opt-in only

Validation is **never automatic**. Per the Task completion protocol in CLAUDE.md, the orchestrator runs it in exactly two cases:

1. On task completion the orchestrator asks the user whether to validate, and delegates to `hooks` only on an explicit yes.
2. The user explicitly requests validation this turn.

Never otherwise. This keeps normal turns fast and token-light; the full battery only fires when the user wants it.

## The orchestrator: `npm run validate`

`scripts/validate.mjs` is the single entry point. The `hooks` agent runs it once and judges success by exit code (0 = pass), never piping it. It:

1. Derives the dirty-list itself (`git diff --name-only HEAD`, `--cached`, `ls-files --others --exclude-standard`).
2. Applies the short-circuit table in code to select stages.
3. Runs the mutating `lint` (`eslint --cache . --fix`) as a serial prefix, then `format:check`, `build`, and `test:run` **in parallel**.
4. Stores a git-content SHA digest sentinel under the git dir; when the tree is unchanged since the last run it prints `mode: cached` and returns the previous result instantly.
5. Exits non-zero on any stage failure, printing only the failing stage's output tail.

Prettier and ESLint run with `--cache` (`.eslintcache` is gitignored), so repeat runs only re-process changed files.

## Short-circuit table

Enforced in `scripts/validate.mjs`:

| Files modified              | format:check | lint | build   | test    |
| --------------------------- | ------------ | ---- | ------- | ------- |
| `.vue`, `.js`, `.ts`, `.mjs`, `.cjs` | ✅  | ✅   | ✅      | ✅      |
| `.scss`, `.css` only        | ✅           | ✅   | ❌ skip | ❌ skip |
| `.md`, `.json`, config only | ❌ skip all  | ❌   | ❌      | ❌      |

The `build` step compiles both SSR bundles (`build:client` + `build:server`). It catches import errors, server/client boundary leaks, and SSR-incompatible code that lint and unit tests miss — the highest-value guard for an SSR project, and the slow one, so it is short-circuited to code changes only.

## The `hooks` agent

The `hooks` agent (model: haiku, tools: Bash) is the sole validation executor. It runs `npm run validate`, relays the report verbatim, and distinguishes a pre-existing baseline failure from a regression introduced by the current change (see `.claude/agents/hooks.md`). No other agent may run validation.

## Dormant native hooks

`.claude/settings._json` (note the `_` prefix) holds a native Stop/PreToolUse hook chain that is **disabled** — the extension keeps it from being loaded by Claude Code. It exists for dual Copilot/Claude-Code compatibility and is a legacy of the automatic-validation era; do NOT rename it to `settings.json`. The live path is the opt-in `hooks`-agent flow above.

The one guard still worth keeping in mind: `guards/subagents/subagents.sh` blocks sub-agent prompts that contain forbidden validation commands (`npm run validate`, `npm test/lint/format/build`, direct `eslint`/`prettier`, `vitest`) and blocks code comments in `.vue/.js/.scss/.css` writes — enforcing the centralized-validation and no-comments rules if the native hooks are ever enabled.
