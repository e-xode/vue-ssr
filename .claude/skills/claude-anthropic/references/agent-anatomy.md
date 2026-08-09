# Sub-agent anatomy (Vue SSR Starter Kit conventions)

## Folder and file

```
.claude/agents/<agent-name>.md
```

- **One file per agent.** Flat directory preferred.
- **`<agent-name>` is kebab-case** and matches the frontmatter `name`.
- Listed in **two places** in `CLAUDE.md`: the `## Agents directory` table (mandatory) and the "Quick delegation card" (when relevant).

## Frontmatter

```yaml
---
name: validation
description: '<single string — same rules as a skill description>'
tools: Bash
model: haiku
---
```

### Fields (harness reality, verified 2026-08-09)

Source: [Sub-agents — supported frontmatter fields](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields). Only `name` and `description` are required.

| Field             | Required    | Notes                                                                                                                           |
| ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | yes         | Lowercase + hyphens, no `:`. Must match the row in `CLAUDE.md` § Agents directory. The filename need not match, but keep it equal |
| `description`     | yes         | Same discriminating + pushy + anti-trigger rules as skills; 80–900 chars (audit-warned), counts toward the always-loaded budget  |
| `tools`           | recommended | **Allowlist.** Omit to inherit everything. Read the trap below before editing one                                               |
| `disallowedTools` | no          | Denylist, applied before `tools`. Cheaper than an allowlist when you only need to remove one or two capabilities                |
| `skills`          | no          | Skills preloaded at startup — **full content injected**, not just the description. The reliable way to guarantee a skill is read |
| `model`           | no          | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit` (the default). Prefer `inherit` unless the tier is a decision  |
| `effort`          | no          | `low`…`max`. Overrides session effort for this agent                                                                            |
| `permissionMode`  | no          | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`                                                        |
| `maxTurns`        | no          | Hard stop on agentic turns                                                                                                      |
| `memory`          | no          | `user` / `project` / `local` — gives the agent persistent cross-session notes of its own                                        |
| `background`      | no          | `true` forces background execution. Unset lets Claude choose; background is the default                                         |
| `isolation`       | no          | `worktree` runs the agent in a throwaway git worktree                                                                           |
| `color`           | no          | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` — distinguishes agents in the task list during a fleet run |
| `hooks`, `mcpServers`, `initialPrompt` | no | Per-agent lifecycle hooks, MCP servers, and a first auto-submitted turn when run as the main session agent            |

### 🚨 The `tools` allowlist trap

**An explicit `tools:` line is an allowlist. Omitting `Skill` from it removes the agent's ability to load any skill at all** — the docs state this as the supported way to *disable* skill access: _"To prevent a subagent from invoking skills entirely, omit `Skill` from the `tools` list or add it to `disallowedTools`."_

This is the single easiest way to silently break this project's architecture, because the whole premise of `CLAUDE.md` is that knowledge lives in skills and agents load them by name. An agent body that says "load and apply `design-scss`" is inert if its frontmatter says `tools: Read, Edit, Write, Glob, Grep`.

Two correct shapes:

- **Non-negotiable skills → `skills:`.** Full content is injected at startup, so it cannot be skipped under pressure. Keep it to 2–3 per agent; each one is paid in that agent's context on every invocation. A skill with `disable-model-invocation: true` **cannot** be preloaded.
- **Discretionary skills → add `Skill` to `tools:`.** Required for anything the body mentions as "consult when relevant".

Related filter worth knowing: a **background** subagent — the default — keeps only a reduced built-in tool set (`Read`, `Grep`, `Glob`, `Bash`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, `TodoWrite`, `Skill`, `ToolSearch`, and a few others) regardless of what `tools:` lists. Tools outside that set silently disappear in the background and reappear in the foreground.

### What a subagent actually receives at startup

It does **not** inherit the parent conversation, the skills the parent already loaded, the parent's auto memory, or the output style. It **does** receive: its own system prompt (the markdown body), the delegation message, the full `CLAUDE.md` hierarchy including `.claude/rules/`, a git-status snapshot, and any `skills:` preloads. This is why rule 3 of the orchestration doctrine demands self-contained prompts — and why a rule that must reach the agent has to be in `CLAUDE.md`, a matching path-scoped rule, or the delegation prompt itself.

## Sub-agent contract (non-negotiable)

1. **Scoped work.** The orchestrator gives the agent a precise scope. The agent does that work and nothing more. Out-of-scope discoveries are **reported, not acted on**.
2. **No validation** (single exception: the `validation` agent). Sub-agents never run `npm test/build/lint/format`. Validation is centralised on the `validation` agent invoked by the orchestrator at task end, on user opt-in.
3. **No code comments** in produced output (`.vue`/`.js`/`.mjs`/`.scss`/`.css`), same as the rest of the project.
4. **Structured return.** What was done / which files were modified / blockers encountered / suggested follow-ups.
5. **Self-contained prompts.** When the orchestrator launches a fleet (multiple sub-agents in parallel), each prompt is complete — sub-agents do not share context with each other.

## Current agent fleet (10 agents)

The roster, scopes, and delegation triggers live in `CLAUDE.md` § Agents directory — the single
source of truth, kept in sync with `.claude/agents/` by `scripts/audit.py`. Only the
anatomy-relevant differentiators are recorded here:

- **Model tiers** — `haiku` for the mechanical validator (`validation`); `opus` for the judgment-heavy
  advisory agent (`marketing`); `sonnet` for the rest.
- **Tool envelopes** — read-only agents (`review`, `visual-qa`) carry no write tools; the advisory
  agent (`marketing`) writes only its skill's `references/`; `validation` runs `Bash` alone.

## Coherence with `CLAUDE.md`

`scripts/audit.py` enforces (as ERRORS):

- Every file in `.claude/agents/` has a corresponding row in `CLAUDE.md` § Agents directory.
- Every agent name referenced in that section exists as `.claude/agents/<name>.md`.

## When to create a new sub-agent (vs. extending one)

Create a new agent when:

- A class of tasks has a **clear domain boundary** (e.g., i18n JSON → `translate` agent: locale files, fleet parallelism is natural).
- Tasks need a **different tool set or model** (`validation` runs only `Bash` on `haiku`; `review` is read-only).
- The orchestrator would otherwise **repeat the same long preamble** to delegate the work.

Extend an existing agent when:

- The new task fits inside an existing scope (e.g., a new Vue pattern → still the `vue` agent).
- Splitting would just mean two agents called in sequence on the same files.

## Anti-patterns specific to agents

- **A sub-agent that validates its own work.** Violates the centralised-validation rule.
- **A sub-agent that delegates to another sub-agent.** Sub-agents stay flat; only the orchestrator delegates. No agent in this fleet carries a delegation tool — parallelism is the orchestrator's job (fan out several agents on independent scopes in one message).
- **An agent description that lists "use for any …" without anti-triggers.** Triggers on too much.
- **Agents kept "in case we need them".** Each agent costs context and decision overhead.
