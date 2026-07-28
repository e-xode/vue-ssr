---
name: vue-ssr-validation
description: "Post-task validation pipeline for the Vue SSR Starter Kit: the validation agent's format/lint/build/test battery behind the single `npm run validate` orchestrator, on user opt-in only. Covers the opt-in trigger (never automatic), validate.mjs (serial lint prefix then parallel stages, prettier/eslint --cache, git-digest sentinel skip) and the dirty-list short-circuit table. Trigger on: validation failures, why a stage ran or was skipped, changing the pipeline, or phrasings like 'run the checks', 'npm run validate', 'lint is failing', 'the build broke', 'format check', 'did the tests pass'. Don't use for: Claude config governance and audit.py (→ claude-anthropic), native Claude Code hooks — none exist in this project (→ claude-anthropic), Vue's lifecycle hooks — a framework concept (→ vue3-composition), app architecture (→ vue-ssr-architecture), auth (→ vue-ssr-auth), deployment (→ vue-ssr-deployment)."
---

# Vue SSR Validation (post-task battery)

> Owns the post-task validation pipeline: format → lint → build → test, executed by the `validation` agent through `npm run validate`.

## When validation runs — opt-in only

Validation is **never automatic**. Per the Task completion protocol in CLAUDE.md, it runs in exactly two cases:

1. The orchestrator offers validation at task end and the user accepts.
2. The user explicitly requests it this turn.

Never otherwise. Normal turns stay fast and token-light; the battery fires only when the user wants it.

## The orchestrator: `npm run validate`

`scripts/validate.mjs` is the single entry point. The `validation` agent runs it once and judges success by exit code (0 = pass), never piping it. It:

1. Derives the dirty-list itself (`git diff --name-only HEAD`, `--cached`, `ls-files --others --exclude-standard`).
2. Applies the short-circuit table below in code to select stages.
3. Runs the mutating `lint` (`eslint --cache . --fix`) as a serial prefix, then `format:check`, `build` and `test:run` **in parallel**, aggregating every result.
4. Stores a git-content SHA digest sentinel under the git dir; when the tree is unchanged since the last run it prints `mode: cached` and returns the previous verdict instantly, so a re-delegation after no edits is near-free.
5. Exits non-zero on any stage failure, printing only the failing stage's output tail.

Prettier and ESLint run with `--cache` (`.eslintcache` is gitignored), so repeat runs only re-process changed files. The individual scripts stay runnable on their own: `format:check`, `lint`, `build`, `test:run`.

## Short-circuit table

Enforced in `scripts/validate.mjs` (the table is the reference spec, the script is the enforcement):

| Files modified                       | format:check | lint | build | test |
| ------------------------------------ | ------------ | ---- | ----- | ---- |
| `.vue`, `.js`, `.ts`, `.mjs`, `.cjs` | yes          | yes  | yes   | yes  |
| `.scss`, `.css` only                 | yes          | yes  | skip  | skip |
| `.md`, `.json`, config only          | skip         | skip | skip  | skip |

Any mix that includes `.vue`/`.js`/`.ts`/`.mjs`/`.cjs` runs the full battery.

The `build` stage compiles both SSR bundles (`build:client` + `build:server`). It catches import errors, client/server boundary leaks and SSR-incompatible code that lint and unit tests miss — the highest-value guard for an SSR project, and the slow one, hence its short-circuit to code changes only.

## The `validation` agent

The `validation` agent (model `haiku`, tools `Bash`) is the sole validation executor and the only sub-agent allowed to run validation. It runs `npm run validate`, relays the report, and distinguishes a pre-existing baseline failure from a regression introduced by the current change. It never fixes code. See `.claude/agents/validation.md`.

## History

The former native-hook wiring (`.claude/hooks/` shell scripts, the dormant `settings._json` kill switch, `hooks-reference.md`) was removed on 2026-07-26 — validation has a single path, the `validation` agent. Decision history: `claude-anthropic` case-studies CS-6.

## See also

- `validation` agent — the validation executor (`.claude/agents/validation.md`).
- `claude-anthropic` — Claude config governance and `audit.py`.
