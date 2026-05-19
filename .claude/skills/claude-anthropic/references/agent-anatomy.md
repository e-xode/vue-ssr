# Sub-agent anatomy (Vue SSR Starter Kit conventions)

## File location

```
.claude/agents/<agent-name>.md
```

One file per agent. `<agent-name>` is kebab-case and matches frontmatter `name`.

## Frontmatter

```yaml
---
name: hooks
description: '<discriminating + pushy + anti-trigger>'
tools: Bash
model: haiku
---
```

### Required fields

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Must match reference in `CLAUDE.md` |
| `description` | yes | Same rules as skill descriptions |
| `tools` | recommended | Restrict to minimum needed |
| `model` | no | `sonnet`, `opus`, `haiku`, or `inherit` |

## Sub-agent contract (non-negotiable)

1. **Scoped work.** Do the assigned work, nothing more. Report out-of-scope discoveries.
2. **No validation** (exception: `hooks` agent). Never run `npm test/lint/format`.
3. **No code comments** in produced output.
4. **Structured return.** What was done / files modified / blockers / follow-ups.
5. **Self-contained prompts.** Each agent gets complete context.

## Current agent fleet (2 agents)

| Agent | Model | Scope |
| --- | --- | --- |
| `hooks` | haiku | Post-task validation (format → lint → test). Sole validation exception. |
| `review` | sonnet | Read-only structured code review. Never modifies code. |

## Coherence with `CLAUDE.md`

`scripts/audit.py` enforces:
- Every file in `.claude/agents/` has a row in `CLAUDE.md` § Agents directory.
- Every agent referenced in that section exists as `.claude/agents/<name>.md`.

## When to create a new agent

Create when:
- A class of tasks has a clear domain boundary
- Tasks need a different tool set or model
- The orchestrator would repeat the same preamble

Extend existing when:
- New task fits inside existing scope
- Splitting means two agents called in sequence on same files
