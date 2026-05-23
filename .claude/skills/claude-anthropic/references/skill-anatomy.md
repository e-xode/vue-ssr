# Skill anatomy (Vue SSR Starter Kit conventions)

## Folder layout

```
.claude/skills/<skill-name>/
├── SKILL.md            (required)
├── references/         (optional, recommended for skills > ~200 lines)
│   └── <topic>.md
├── scripts/            (optional, deterministic tooling)
└── evals/              (optional, test cases)
    └── evals.json
```

- **`<skill-name>` is kebab-case** and matches the frontmatter `name` exactly.
- **Domain prefix `vue-ssr-`** for project-scoped skills. Cross-cutting skills (`review`, `skill-creator`, `claude-anthropic`) have no prefix.

## Frontmatter

```yaml
---
name: skill-name
description: '<single string, no line breaks>'
---
```

Only `name` and `description` are required.

### Description rules

The description is the **primary triggering mechanism**. Three constraints:

1. **Discriminating.** State the exact domain, key file paths, key types, trigger keywords.
2. **Pushy.** Use phrasings like "Trigger whenever the user mentions X".
3. **Anti-triggered.** Always include `Don't use for: ...` pointing to the correct alternative.

Min length: 80 characters. Max budget: 1,536 characters.

### Description example (good)

```
"Architecture reference for the Vue SSR Starter Kit: Vue 3.5 + Vite 7 + Express 5 + MongoDB. Covers file structure, SSR lifecycle, locale routing, shared utilities. Trigger on architecture, routing, SSR, or utility questions. Don't use for: auth (→ vue-ssr-auth), deployment (→ vue-ssr-deployment)."
```

### Description example (bad)

```
"Helps with the project architecture."
```

## `SKILL.md` body

- **≤ ~500 lines / 50 KB.** Hard warn at 50 KB.
- **Method + index.** What to do, and where to look for details.
- **Imperative voice.** Same as `CLAUDE.md`.
- **Tables for enumerations.**
- **No code comments** outside fenced blocks.

### Recommended sections

1. Lead paragraph — what the skill owns
2. In/out scope table
3. Division of responsibilities (only for twin skills)
4. Core rules — minimum set
5. Workflows — numbered lists with handoffs
6. Routing table — "if you need X, read references/Y"

## `references/` rules

- One topic per file. Split past ~300 lines.
- No frontmatter in references.
- Heading hierarchy starts at `#`.
- Critical rules must also appear briefly in `SKILL.md` with a pointer.

## Scripts placement

Scripts belong to one skill under `scripts/`:

- No `.claude/scripts/` global pool (anti-pattern).
- Stdlib first (Python/Bash, no external deps).
- Executable + shebang. Usage docstring at top.
- Exit code 0 on success, 1 on failure.
- No `--fix` mode by default.

## When to split a skill

Split when:

- Two distinct domains with different triggering profiles
- Body exceeds 500 lines with independently triggerable topics

Do NOT split when:

- Two parts always load together
- The "split" is just chapters of one procedure (use references/)
