# Hooks directory — Vue SSR Starter Kit

## What this directory contains

Validation shell scripts (format, lint, test) plus guards (comment blocker, sub-agent validation blocker), designed to run as **GitHub Copilot** hooks on the `PreToolUse` and `Stop` events. They enforce the format → lint → test battery and the project rules automatically after every code-modifying task.

## Dual setup (by design)

This starter kit is meant to be forked and used with **either GitHub Copilot or Claude Code** (or both). Validation is therefore guaranteed through two complementary mechanisms:

1. **Copilot path — shell hooks (currently dormant).** The scripts in this directory are wired through `.claude/settings._json`. The underscore in the filename is a deliberate kill switch: it prevents the hooks from loading. See "Why dormant" below.
2. **Claude path — the `hooks` agent (active).** Under Claude Code, the orchestrator delegates validation to the `hooks` agent (`.claude/agents/hooks.md`) per the Task completion protocol in `CLAUDE.md`. This is the active, trusted validation path today.

Both paths run the same battery (format → lint → test) and produce the same guarantee.

## Why the shell hooks are dormant

A known bug in GitHub Copilot causes unreliable hook execution when shell-based hooks are configured via `settings.json`: hooks fail silently, run out of order, or hang the session. Until that is fixed upstream, the shell hooks stay disabled (`._json`) and the `hooks` agent carries validation.

The scripts are kept **maintained and cross-platform** so they are ready to re-enable the day the Copilot bug is fixed — they are dormant, not abandoned.

## Cross-platform support

Scripts run on **macOS, Linux, and Windows (via Git Bash or WSL)**. Native Windows `cmd`/PowerShell is not supported (the hooks are bash). All OS-divergent mechanics are centralized in `lib/portable.sh`:

- `portable_stat` — GNU (`stat -c`) vs BSD/macOS (`stat -f`) auto-detection
- `portable_timestamp` — ISO-8601 on both GNU and BSD `date`
- `portable_hash` — `shasum`, falling back to `sha1sum`
- `compute_digest` — the change-digest pipeline (shared by `changes.sh` and `format.sh`)
- `require_jq` / `emit_block` — graceful handling when `jq` is missing

## Prerequisites

- `bash` (Git Bash or WSL on Windows)
- `git`
- `jq` — required by the guards and prompt hooks. **If absent, those hooks fail open** (log a warning and exit 0) so a missing dependency never breaks a session.
- `shasum` or `sha1sum`

## Re-enabling hooks (future, Copilot only)

When the Copilot bug is confirmed fixed:

1. Ensure `jq` is installed.
2. Rename `.claude/settings._json` → `.claude/settings.json`.
3. Remove the manual delegation step from the orchestrator workflow in `CLAUDE.md`.
4. The `PreToolUse`/`Stop` hooks fire automatically — no agent needed.

**Do NOT re-enable until the Copilot bug is confirmed fixed.** Premature re-enabling breaks the validation guarantee and causes unpredictable session behavior.

## Directory structure

```
.claude/hooks/
├── lib/            # Shared cross-platform helpers (portable.sh)
├── guards/         # PreToolUse blockers
│   ├── changes/    # Git digest sentinel (skip if unchanged)
│   └── subagents/  # Block validation commands + code comments in sub-agent writes
├── scripts/        # Stop event validation (format, lint, test)
│   ├── format/
│   ├── lint/
│   └── test/
├── logs/           # Timestamped logging infrastructure
└── prompts/        # Injected prompts on events
```
