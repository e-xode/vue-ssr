# Hooks reference (Vue SSR Starter Kit)

## Status

Project hooks are configured in `.claude/settings._json` (disabled via `._json` extension). Validation is performed by the orchestrator delegating to the `hooks` **agent**.

### Why disabled

The shell hooks are intentionally disabled due to a **known bug in GitHub Copilot** that causes unreliable hook execution — hooks fail silently, run out of order, or hang the session. The `._json` extension is a deliberate kill switch, not accidental.

The `hooks` agent exists as the active workaround: the orchestrator delegates validation manually at task end, achieving the same format → lint → test guarantee without relying on buggy automatic execution.

**Do NOT re-enable** by renaming to `settings.json` until the Copilot bug is confirmed fixed upstream. Premature re-enabling breaks the validation pipeline.

When enabling hooks (after bug fix), rename to `.claude/settings.json`.

## Where hooks live

```
.claude/hooks/
├── guards/         # block tools before they run (PreToolUse)
│   ├── changes/    # git digest change detection
│   └── subagents/  # block validation in sub-agent prompts
├── scripts/        # validation executables (Stop event)
│   ├── lint/
│   ├── test/
│   └── format/
├── logs/           # logging infrastructure
└── prompts/        # injected prompts on events
    └── tests/
```

## Hook events (key ones for this project)

| Event | Fires when | Can block? |
| --- | --- | --- |
| `PreToolUse` | Before a tool call executes | Yes (exit 2) |
| `Stop` | Claude finishes responding | Yes (exit 2 continues conversation) |
| `SessionStart` | Session begins | No |

## Configuration format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task|Edit|MultiEdit|Write|create",
        "hooks": [{ "type": "command", "command": ".claude/hooks/guards/subagents/subagents.sh" }]
      }
    ],
    "Stop": [
      { "matcher": "", "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/format/format.sh" }] },
      { "matcher": "", "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/lint/lint.sh" }] },
      { "matcher": "", "hooks": [{ "type": "command", "command": ".claude/hooks/scripts/test/test.sh" }] }
    ]
  }
}
```

## Exit code semantics

| Exit code | Meaning |
| --- | --- |
| `0` | Success — proceed. Stdout parsed for JSON |
| `2` | Blocking error — block the action |
| Other | Non-blocking error — continues, stderr logged |

## Current hook scripts

| Script | Event | Purpose |
| --- | --- | --- |
| `guards/subagents/subagents.sh` | PreToolUse | Blocks validation commands in sub-agent prompts, blocks code comments |
| `guards/changes/changes.sh` | (sourced) | Git digest sentinel — skip if unchanged |
| `scripts/format/format.sh` | Stop | Run prettier |
| `scripts/lint/lint.sh` | Stop | Run eslint |
| `scripts/test/test.sh` | Stop | Run vitest |
| `prompts/tests/tests.sh` | Stop | Inject "update tests" prompt (once per session) |
| `logs/logs.sh` | (sourced) | Timestamped logging to ~/.copilot/logs/hooks.log |

## When NOT to write a hook

- The work belongs to a sub-agent (validation → `hooks` agent)
- Tightly coupled to specific features (prefer a skill)
- Would just print advice (belongs in a skill description)
