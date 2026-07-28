# `CLAUDE.md` anatomy

`CLAUDE.md` is loaded **every turn** into the agent's system context. Every byte costs tokens on every request. This is the single hardest constraint on the file.

## Token budget

- **Target: ≤ 10 KB / ~2500 tokens.** Enforced as an `ERROR` by `scripts/audit.py` (project convention).
- **Official Anthropic guideline: target under 200 lines per CLAUDE.md file.** Longer files consume more context and reduce adherence.
- If a section grows beyond ~30 lines, it almost always belongs in a skill.

## Loading hierarchy

_(Official — docs.anthropic.com/en/docs/claude-code/memory)_

All levels are **merged** (not overridden) and presented to the model in this order:

1. **Managed policy** — org/enterprise-level.
2. **User instructions** — `~/.claude/CLAUDE.md` (personal, all projects).
3. **Project instructions** — `./CLAUDE.md` or `./.claude/CLAUDE.md` (team-shared, checked into git).
4. **Local instructions** — `./CLAUDE.local.md` (personal project-specific, **gitignored**).

`CLAUDE.local.md` is for preferences that don't belong in the shared file (sandbox URLs, personal test data). Add it to `.gitignore`.

## Path-scoped rules (`.claude/rules/`)

_(Official — docs.anthropic.com/en/docs/claude-code/memory#organize-rules-with-claude/rules/)_

An alternative to putting everything in CLAUDE.md. Each `.md` file in `.claude/rules/` covers one topic. Rules **without** `paths:` frontmatter load unconditionally (same priority as `.claude/CLAUDE.md`). Rules **with** `paths:` frontmatter load only when Claude works on matching files.

```yaml
---
paths:
  - 'src/**/*.vue'
---
```

Use path-scoped rules to reduce context noise — instructions load only when relevant.

## What belongs in `CLAUDE.md`

Only **hard rules** — operational, project-wide, non-negotiable, that the agent must apply without prior context loading.

| Belongs                                            | Does NOT belong                             |
| -------------------------------------------------- | ------------------------------------------- |
| Task completion protocol (validation gate)         | How a feature works                         |
| No auto-commit / no auto-validation rules          | Architecture explanations                   |
| Code-style hard limits (no comments, English only) | Tutorial content / long explanations        |
| Bash commands Claude can't guess                   | Anything Claude can infer from reading code |
| Agent fleet directory (1-line trigger per agent)   | Detailed agent prompts                      |
| Skills index (one line per skill)                  | Skill bodies                                |
| Sub-agent orchestration rules                      | Examples / case studies                     |
| Repo etiquette (branch naming, PR conventions)     | File-by-file codebase descriptions          |
| Dev env quirks (required env vars, gotchas)        | Info that changes frequently                |
| The "Golden Rule" (regression = audit)             | Standard conventions Claude already knows   |

Anything that needs more than 3 lines to explain → move to a skill and reference it from the index.

## Required sections (current project)

1. **Task completion protocol** — the validation gate (delegated to `hooks` agent).
2. **Hard rules** — no auto-commit, no code comments, English only, Vuetify-first, SSR-safe.
3. **Path-scoped rules** — instruction to read `.claude/rules/` on file edits.
4. **Agents directory** — 7-agent table with one-line triggers.
5. **Sub-agent orchestration** — non-negotiable rules: validation is centralised, sub-agents return structured summaries, no out-of-scope work.
6. **Golden Rule** — regression handling (audit, not patch).
7. **Meta** — load behaviour, budget reminder, link to `skill-creator`.
8. **Skills index** — compact family listing with representative triggers.

## Writing rules

- **Imperative voice.** "Do X" / "Never Y" / "Delegate to Z". Not "should" / "may".
- **No prose explanations.** A rule is enforceable or it does not belong.
- **No code comments.** Inside fenced code blocks is fine; in prose, never.
- **Tables over bullets** for any structured enumeration (agents, skills, file-type matrices).
- **Cross-reference skills by name** (`see skill-creator`, `→ vue-ssr-validation`), never paste their content.

## Anti-patterns specific to `CLAUDE.md`

- Pasting a skill's introduction directly in `CLAUDE.md` "so the agent always sees it".
- Adding a "Tips" or "FAQ" section.
- Embedding procedural steps that change frequently (they will rot; a skill can be updated in isolation).
- Adding decorative emojis throughout prose (the `🚨` for the task-completion protocol is intentional and exceptional — it marks the single most-violated rule).

## When in doubt

If you're about to add content to `CLAUDE.md`, ask:

1. Will the agent need this on **every** turn? If no → skill.
2. Is it a **hard rule** or a **best practice**? Best practices → skill.
3. Is it more than **3 lines**? → skill.
4. Does it require **examples** to be understood? → skill.

Three "no" → it belongs in `CLAUDE.md`. Otherwise, write a skill (or extend an existing one).
