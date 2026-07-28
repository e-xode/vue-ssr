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
name: hooks
description: '<single string — same rules as a skill description>'
tools: Bash
model: haiku
---
```

### Required and recommended fields

| Field         | Required    | Notes                                                                                                                           |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | yes         | Unique identifier (lowercase + hyphens). Must match the reference in `CLAUDE.md`                                                |
| `description` | yes         | Same discriminating + pushy + anti-trigger rules as skills; 80–900 chars (audit-warned), counts toward the always-loaded budget |
| `tools`       | recommended | Allowlist of tools. Restrict to the minimum needed. Common: `Bash`, `Read`, `Edit`, `Grep`, `Glob`                              |
| `model`       | no          | `sonnet`, `opus`, `haiku`, a full model ID, or `inherit` (default). Use `haiku` for narrow validation/lookup agents             |

## Sub-agent contract (non-negotiable)

1. **Scoped work.** The orchestrator gives the agent a precise scope. The agent does that work and nothing more. Out-of-scope discoveries are **reported, not acted on**.
2. **No validation** (single exception: the `hooks` agent). Sub-agents never run `npm test/build/lint/format`. Validation is centralised on the `hooks` agent invoked by the orchestrator at task end.
3. **No code comments** in produced output (`.vue`/`.js`/`.mjs`/`.scss`/`.css`), same as the rest of the project.
4. **Structured return.** What was done / which files were modified / blockers encountered / suggested follow-ups.
5. **Self-contained prompts.** When the orchestrator launches a fleet (multiple sub-agents in parallel), each prompt is complete — sub-agents do not share context with each other.

## Current agent fleet (10 agents)

The roster, scopes, and delegation triggers live in `CLAUDE.md` § Agents directory — the single
source of truth, kept in sync with `.claude/agents/` by `scripts/audit.py`. Only the
anatomy-relevant differentiators are recorded here:

- **Model tiers** — `haiku` for the mechanical validator (`hooks`); `opus` for the judgment-heavy
  advisory agent (`marketing`); `sonnet` for the rest.
- **Tool envelopes** — read-only agents (`review`, `visual-qa`) carry no write tools; the advisory
  agent (`marketing`) writes only its skill's `references/`; `hooks` runs `Bash` alone.

## Coherence with `CLAUDE.md`

`scripts/audit.py` enforces (as ERRORS):

- Every file in `.claude/agents/` has a corresponding row in `CLAUDE.md` § Agents directory.
- Every agent name referenced in that section exists as `.claude/agents/<name>.md`.

## When to create a new sub-agent (vs. extending one)

Create a new agent when:

- A class of tasks has a **clear domain boundary** (e.g., i18n JSON → `translate` agent: locale files, fleet parallelism is natural).
- Tasks need a **different tool set or model** (`hooks` runs only `Bash` on `haiku`; `review` is read-only).
- The orchestrator would otherwise **repeat the same long preamble** to delegate the work.

Extend an existing agent when:

- The new task fits inside an existing scope (e.g., a new Vue pattern → still the `vue` agent).
- Splitting would just mean two agents called in sequence on the same files.

## Anti-patterns specific to agents

- **A sub-agent that validates its own work.** Violates the centralised-validation rule.
- **A sub-agent that delegates to another sub-agent.** Sub-agents stay flat; only the orchestrator delegates. No agent in this fleet carries a delegation tool — parallelism is the orchestrator's job (fan out several agents on independent scopes in one message).
- **An agent description that lists "use for any …" without anti-triggers.** Triggers on too much.
- **Agents kept "in case we need them".** Each agent costs context and decision overhead.
