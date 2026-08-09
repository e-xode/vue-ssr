# Skill anatomy (Vue SSR Starter Kit conventions)

## Folder layout

```
.claude/skills/<skill-name>/
├── SKILL.md            (required)
├── references/         (optional, recommended for any skill > ~200 lines)
│   ├── <topic-1>.md
│   └── <topic-2>.md
├── scripts/            (optional, deterministic tooling)
└── assets/             (optional, files used in output)
```

- **`<skill-name>` is kebab-case** and matches the frontmatter `name` exactly. Enforced by `scripts/audit.py`.
- **Domain prefix is mandatory** when the skill is scoped to a project area: `vue-ssr-*`, `vue3-*`, `vuetify-*`, `design-*`, `marketing-*`. Cross-cutting skills (like `translate`, `review`, `seo`, `skill-creator`, `claude-anthropic`, `starter-kit-adapt`) have no prefix.

## Frontmatter

```yaml
---
name: skill-name
description: '<single string, no line breaks>'
---
```

**Project convention: always declare both `name` and `description`, and keep `name` equal to the folder name.** `audit.py` enforces it. The harness is looser than that — see the field table below — but a skill whose declared name differs from its directory is a trap for every human reading the tree.

### Supported fields (harness reality, verified 2026-08-09)

Source: [Skills — frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference). None of these fields is strictly required; a skill with no frontmatter at all still loads.

| Field                      | Harness behaviour                                                                                          | Used here          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| `name`                     | Display label in listings. For a project skill the invocation name still comes from the **directory**       | yes (all 33)       |
| `description`              | The trigger surface. Falls back to the first paragraph of the body if omitted                              | yes (all 33)       |
| `when_to_use`              | Appended to `description` in the listing; shares the same 1,536-char cap                                   | no — fold into `description` |
| `allowed-tools`            | Tools usable without a permission prompt during the invoking turn; grant clears on the next message         | not yet — see below |
| `disallowed-tools`         | Removes tools from the pool while the skill is active                                                      | no                 |
| `disable-model-invocation` | `true` keeps the description **out of the always-loaded listing**; the skill stays reachable as `/name`     | no — the budget lever the project has not used |
| `user-invocable`           | `false` hides it from the `/` menu; description stays in context                                           | no                 |
| `model`                    | Model for the rest of the invoking turn                                                                    | no                 |
| `context: fork` / `agent` / `background` | Runs the skill as a subagent instead of inline                                               | no                 |
| `argument-hint` / `arguments` | Autocomplete hint and named `$placeholders`                                                             | no                 |
| `metadata`                 | Free-form map for your own tooling; Claude Code ignores the contents                                       | no                 |
| `license`                  | Agent Skills spec field; accepted, not acted on                                                            | `frontend-design`  |
| `compatibility`            | Agent Skills spec field, ≤ 500 chars; accepted, not acted on                                               | no                 |

**Portability caveat.** Only six fields are part of the [Agent Skills](https://agentskills.io) open standard: `name`, `description`, `allowed-tools`, `license`, `metadata`, `compatibility`. Everything else is a Claude Code extension and raises `Unexpected key(s) in SKILL.md frontmatter` when the skill is shipped through claude.ai or the Skills API. This repo is a public starter kit whose skills people copy elsewhere — prefer the six portable fields unless a Claude Code extension earns its keep.

### Running a bundled script without a prompt

A skill that tells the agent to run its own script should grant it, so the instruction still works once `bypassPermissions` is gone:

```yaml
allowed-tools: Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/audit.py *)
```

`${CLAUDE_SKILL_DIR}` and `${CLAUDE_PROJECT_DIR}` are substituted in both the body and the `allowed-tools` rules, so the grant and the documented command match literally — which is what the permission matcher requires. `${CLAUDE_SKILL_DIR}` also survives a fork that renames the repository directory.

### The 1,536-char cap

The combined `description` + `when_to_use` text is truncated at **1,536 characters** per skill in the listing. Put the most important trigger information first — anything past the cap is invisible during skill selection. The cap itself is configurable via `skillListingMaxDescChars`, but treat it as fixed: it is a per-skill ceiling and rarely the binding constraint here (see the aggregate budget below).

### `description` rules

The description is the **primary triggering mechanism**. Three constraints:

1. **Discriminating.** State the _exact_ domain, key file paths, key types, and key concepts. Listing 5–10 trigger keywords beats a vague sentence.
2. **Pushy.** Claude under-triggers skills by default. Use phrasings like "Trigger this skill **whenever** the user mentions X, even if they don't say 'skill'" or "Always load X together with Y".
3. **Anti-triggered.** Always include a `Don't use for: ...` clause that points to the correct alternative skill. This both improves precision and aids discovery.

Minimum length enforced: 80 characters. Anti-trigger clause enforced as a warning by `scripts/audit.py`.

### Description budget

The description is the trigger surface, nothing more: triggers + anti-triggers. Enumerated knowledge (entity lists, technique catalogs, option enumerations) belongs in the body or `references/`. Target ≤ 600 chars for secondary/non-routing domains; only primary routing skills earn more.

**How the listing budget actually works** (verified 2026-08-09, [docs](https://code.claude.com/docs/en/skills#skills-arent-being-used)) — this corrects the project's earlier model:

- The listing **always contains every skill name**. Overflow costs *descriptions*, not skills.
- The budget is **1 % of the model's context window** by default, scaled by `skillListingBudgetFraction` in `.claude/settings.json` (this repo ships `0.025`). `SLASH_COMMAND_TOOL_CHAR_BUDGET` sets a fixed char count instead.
- On overflow, Claude Code **drops descriptions starting with the skills you invoke least**, so frequently-used skills keep their full text. It is a graceful degradation, not a hard cutoff at a fixed offset.
- Because the budget scales with the context window, **the same config is safe on a 1M-context session and heavily truncated on a 200k one.** That matters for a public starter kit: a forker on a standard-context model gets a much smaller listing than the maintainer does.
- `/doctor` estimates the listing's cost and its biggest contributors; `/context` reports the post-budget size; `--debug` logs a warning on overflow.

Three levers, cheapest first:

1. `disable-model-invocation: true` on a skill that is only ever invoked deliberately — removes its description from the listing entirely while keeping `/name` working. Caveat: such a skill **cannot** be named in a subagent's `skills:` preload field.
2. `skillOverrides` set to `"name-only"` in settings for a low-priority skill — lists the name without the description.
3. Trimming descriptions — do this last, and only by removing restated body knowledge, never a trigger or an anti-trigger.

The project additionally caps the whole always-loaded surface (CLAUDE.md bytes + all skill descriptions + all agent descriptions) at 43,000 chars WARN / 47,000 ERROR, with a ≤ 23,000-char sub-budget on skill descriptions alone. Those are project ratchets, not harness limits: they exist so growth is a decision rather than a side effect. `scripts/audit.py` prints the running total as INFO on every run.

### Description example (good)

```
description: "Enforce the SCSS design system of the Vue SSR Starter Kit. Use this
before touching any .scss file, Vuetify theme override, mixin, Sass token, page
stylesheet, or shared style helper. Push back on bespoke SCSS when Vuetify
components, props, utilities, defaults, or theme tokens already solve the problem.
Don't use for: modern CSS in non-Vuetify contexts (→ design-css), UX/a11y quality
audits (→ design-ux), or Vuetify component prop/slot decisions (→ vuetify-*)."
```

### Description example (bad)

```
description: "Helps with SCSS in the project."
```

Why it fails: no triggers, no anti-triggers, no file paths, no discrimination from any other skill.

## `SKILL.md` body

### Target shape

- **≤ ~500 lines / 50 KB.** Hard warn at 50 KB by `scripts/audit.py`.
- **Method + index.** What to do, and where to look for details. Not the encyclopedia itself.
- **Imperative voice.** Same as `CLAUDE.md`.
- **Tables for enumerations** (responsibilities, routing, decision matrices).
- **No code comments** outside fenced blocks.

### Recommended sections (project convention)

1. **Lead paragraph** — what the skill owns in one or two sentences.
2. **In/out scope table** — what belongs here, what is delegated elsewhere.
3. **Division of responsibilities** (only for twin skills, e.g., `claude-anthropic` ↔ `skill-creator`).
4. **Core rules** — the minimum set to remember without reading references.
5. **Workflows** — one numbered list per common task, with `➜ See skill: ...` handoffs.
6. **Routing table** — "if you need X, read references/Y".

## `references/` rules

- **One topic per file.** If a reference grows past ~300 lines, split it.
- **Table of contents** at the top of any reference > 300 lines.
- **No frontmatter** in references — they are not skills.
- **Heading hierarchy** starts at `#` (top-level), same as `SKILL.md`.
- References are loaded **on demand** — they may be skipped on cheap tasks. Never put a critical rule only in a reference; mention it briefly in `SKILL.md` with a pointer.

## Scripts placement

Skills may bundle executable tooling under `scripts/`:

### Rules

- **Scripts belong to one skill.** The owner is the skill whose body or references invoke or document the script. Never share a script across skills via a global pool.
- **No `.claude/scripts/` pool.** Top-level `.claude/scripts/` is an anti-pattern. Anthropic's official skill anatomy lists `scripts/` as a **bundled resource of a skill**, not a project-wide directory. `audit.py` check #13 enforces this as an ERROR.
- **Documented in the owning `SKILL.md` or a reference.** A script that no skill calls or describes is orphan code.
- **Stdlib first.** Prefer Python/Bash with no external dependencies.
- **Executable + shebang.** `chmod +x` and a `#!/usr/bin/env python3` / `#!/usr/bin/env bash` line.
- **Exit code 0 on success, 1 on failure.**
- **No `--fix` mode by default.** Audit/validation scripts propose corrections; the user applies them.

## When to split a skill

Split when:

- The skill touches **two distinct domains** (e.g., Express routes and the SSR lifecycle → split into `vue-ssr-server` and `vue-ssr-architecture`).
- The body exceeds **500 lines** and the topics inside are independently triggerable.
- Two parts have **different triggering profiles**.

Do NOT split when:

- The two parts are always loaded together (split is cosmetic and costs context).
- The "split" is just chapters of the same procedure (use `references/` instead).

## Anti-triggers, in practice

The anti-trigger clause should be the **last sentence** of the description, prefixed with `Don't use for:`. Each anti-trigger must point to the correct alternative (skill, agent, or "this is a framework concept").

```
Don't use for: post-task code validation (→ validation agent), Vuetify component API (→ vuetify-components), or Vue lifecycle hooks (framework concept).
```
