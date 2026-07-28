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

Only `name` and `description` are required.

### Truncation budget (official Anthropic)

The combined text of `description` + `when_to_use` is **truncated at 1,536 characters** in the skill listing shown to the model. Put the most important trigger information first — anything beyond 1,536 chars is invisible to the model during skill selection.

### `description` rules

The description is the **primary triggering mechanism**. Three constraints:

1. **Discriminating.** State the _exact_ domain, key file paths, key types, and key concepts. Listing 5–10 trigger keywords beats a vague sentence.
2. **Pushy.** Claude under-triggers skills by default. Use phrasings like "Trigger this skill **whenever** the user mentions X, even if they don't say 'skill'" or "Always load X together with Y".
3. **Anti-triggered.** Always include a `Don't use for: ...` clause that points to the correct alternative skill. This both improves precision and aids discovery.

Minimum length enforced: 80 characters. Anti-trigger clause enforced as a warning by `scripts/audit.py`.

### Description budget

The description is the trigger surface, nothing more: triggers + anti-triggers. Enumerated knowledge (entity lists, technique catalogs, option enumerations) belongs in the body or `references/`. Target ≤ 600 chars for secondary/non-routing domains; only primary routing skills earn more, up to the 1,536 hard cap. Every description char is paid every turn from the shared always-loaded budget (CLAUDE.md bytes + all skill descriptions + all agent descriptions ≤ 43,000 chars WARN / 47,000 ERROR), audited by `scripts/audit.py` which prints the running total as INFO.

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
