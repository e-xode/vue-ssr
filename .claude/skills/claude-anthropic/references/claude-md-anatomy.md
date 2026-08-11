# `CLAUDE.md` anatomy

`CLAUDE.md` is loaded **every turn** into the agent's system context. Every byte costs tokens on every request. This is the single hardest constraint on the file.

## Token budget

- **Target: ≤ 10.5 KB / ~2600 tokens.** Enforced as an `ERROR` by `scripts/audit.py` (project convention; raised from 10 KB — see case-studies CS-9).
- **Official Anthropic guideline: target under 200 lines per CLAUDE.md file.** Longer files consume more context and reduce adherence.
- If a section grows beyond ~30 lines, it almost always belongs in a skill.

## Loading hierarchy

_(Official — [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory))_

All levels are **merged** (not overridden) and concatenated in this order, broadest scope first:

1. **Managed policy** — org/enterprise-level (`/etc/claude-code/CLAUDE.md` on Linux). Cannot be excluded.
2. **User instructions** — `~/.claude/CLAUDE.md` (personal, all projects).
3. **Project instructions** — `./CLAUDE.md` or `./.claude/CLAUDE.md` (team-shared, checked into git).
4. **Local instructions** — `./CLAUDE.local.md` (personal project-specific, **gitignored**).

Claude Code walks **up** the directory tree from the working directory and loads every `CLAUDE.md` / `CLAUDE.local.md` it finds, root-first. Files in **subdirectories** below the working directory are not loaded at launch — they load on demand when Claude reads a file in that directory.

Three mechanics worth knowing for this repo:

- **`@path` imports** are expanded at launch, so an import does not save context — it only organises. Max recursion depth is 4 hops. Import parsing skips code spans, so `` `@README` `` in backticks stays literal.
- **Block-level HTML comments are stripped** before injection. `<!-- maintainer note -->` costs zero tokens and is the sanctioned way to leave a note for humans in `CLAUDE.md` — the "no code comments" project rule targets prose clutter, not these.
- **`claudeMdExcludes`** in settings skips ancestor `CLAUDE.md` files by glob. Relevant only in a monorepo; this repo is standalone.

CLAUDE.md is delivered as a **user message after the system prompt**, not as part of it. It shapes behaviour; it does not enforce it. Anything that must hold regardless of what the model decides needs a hook or a permission rule — which is exactly why this project's hard rules are paired with `audit.py` and `npm run validate` rather than trusted as prose alone.

**Not the same thing as auto memory.** `~/.claude/projects/<project>/memory/MEMORY.md` is written by Claude, machine-local, and capped at 200 lines / 25 KB at load. It is not part of this repo's configuration surface and must never be relied on for project doctrine — a forker gets none of it.

## Path-scoped rules (`.claude/rules/`)

_(Official — [Organize rules with .claude/rules/](https://code.claude.com/docs/en/memory#organize-rules-with-claude-rules))_

An alternative to putting everything in CLAUDE.md. Each `.md` file in `.claude/rules/` covers one topic. Rules **without** `paths:` frontmatter load unconditionally (same priority as `.claude/CLAUDE.md`). Rules **with** `paths:` frontmatter load only when Claude reads or edits matching files.

```yaml
---
paths:
  - 'src/**/*.vue'
---
```

Use path-scoped rules to reduce context noise — instructions load only when relevant. Full anatomy and the rule-vs-skill decision in [rules-anatomy.md](./rules-anatomy.md).

**Compaction caveat.** The project-root `CLAUDE.md` is re-read from disk and re-injected after `/compact`. Nested `CLAUDE.md` files and rules with `paths:` frontmatter are **not** — they reload only the next time Claude touches a matching file. A guardrail that must survive a long session belongs in `CLAUDE.md`, not in a path-scoped rule.

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

1. **Task completion protocol** — the changelog step plus the opt-in validation gate (delegated to the `validation` agent) and the offer-gated visual gate.
2. **Hard rules** — no auto-commit, no code comments, English only, Vuetify-first, SSR-safe.
3. **Path-scoped rules** — instruction to read `.claude/rules/` on file edits.
4. **Agents directory** — 10-agent table with one-line triggers.
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
