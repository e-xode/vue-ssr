# Hooks directory — Vue SSR Starter Kit

## What this directory contains

Validation shell scripts (format, lint, test) designed to run as GitHub Copilot Code hooks on the **Stop** event. They enforce the format → lint → test battery automatically after every code-modifying task.

## Current status: DISABLED

These hooks are **intentionally disabled**. The configuration file is named `.claude/settings._json` (note the underscore) — this non-standard extension prevents Copilot from loading it.

### Why disabled

A known bug in GitHub Copilot causes unreliable hook execution when shell-based hooks are configured via `settings.json`. The bug manifests as hooks failing silently, running out of order, or causing the session to hang. Until this is fixed upstream, automatic hooks cannot be trusted for validation.

### Active workaround

The project uses the **`hooks` agent** (`.claude/agents/hooks.md`) as a manual workaround:

1. The orchestrator completes a code-modifying task.
2. Per the Task completion protocol in `CLAUDE.md`, it delegates to the `hooks` agent.
3. The `hooks` agent runs format → lint → test and reports results.
4. The orchestrator fixes failures and re-delegates until clean.

This achieves the same validation guarantee without relying on the buggy automatic hook system.

## Re-enabling hooks (future)

When the Copilot bug is confirmed fixed:

1. Rename `.claude/settings._json` → `.claude/settings.json`
2. Remove the manual delegation step from the orchestrator workflow
3. The Stop event hooks fire automatically — no agent needed

**Do NOT re-enable hooks until the Copilot bug is confirmed fixed.** Premature re-enabling breaks the validation guarantee and causes unpredictable session behavior.

## Directory structure

```
.claude/hooks/
├── guards/         # PreToolUse blockers
│   ├── changes/    # Git digest sentinel (skip if unchanged)
│   └── subagents/  # Block validation commands in sub-agent prompts
├── scripts/        # Stop event validation (format, lint, test)
│   ├── format/
│   ├── lint/
│   └── test/
├── logs/           # Timestamped logging infrastructure
└── prompts/        # Injected prompts on events
```
