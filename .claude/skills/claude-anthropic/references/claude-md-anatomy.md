# `CLAUDE.md` anatomy

`CLAUDE.md` is loaded **every turn** into the agent's system context. Every byte costs tokens on every request.

## Token budget

- **Target: ≤ 10 KB / ~2500 tokens.** Enforced as an `ERROR` by `scripts/audit.py`.
- If a section grows beyond ~30 lines, it almost always belongs in a skill.

## What belongs in `CLAUDE.md`

Only **hard rules** — operational, project-wide, non-negotiable.

| ✅ Belongs                                       | ❌ Does NOT belong        |
| ------------------------------------------------ | ------------------------- |
| Task completion protocol (validation gate)       | How a feature works       |
| No auto-commit / no-comments rules               | Architecture explanations |
| Code-style hard limits                           | Tutorial content          |
| Agent fleet directory (1-line trigger per agent) | Detailed agent prompts    |
| Skills index (one line per skill)                | Skill bodies              |
| Sub-agent orchestration rules                    | Examples / case studies   |
| Commands quick reference                         | File-by-file descriptions |

Anything needing more than 3 lines → move to a skill and reference it from the index.

## Required sections (current project)

1. **Task completion protocol** — validation gate (delegate to `hooks` agent)
2. **Hard rules** — no auto-commit, no comments, SCSS externalized, i18n, Composition API, etc.
3. **Path-scoped rules** — instruction to load `.claude/rules/`
4. **Agents directory** — table with one-line triggers
5. **Sub-agent orchestration** — centralized validation, sub-agent contract, reuse before writing
6. **Commands** — npm scripts quick reference
7. **Meta** — budget reminder, link to skills
8. **Skills index** — one row per skill with discriminating trigger

## Writing rules

- **Imperative voice.** "Do X" / "Never Y" / "Delegate to Z".
- **No prose explanations.** A rule is enforceable or it does not belong.
- **Tables over bullets** for structured enumerations.
- **Cross-reference skills by name**, never paste their content.

## When in doubt

1. Will the agent need this on **every** turn? If no → skill.
2. Is it a **hard rule** or a **best practice**? Best practices → skill.
3. Is it more than **3 lines**? → skill.
4. Does it require **examples**? → skill.
