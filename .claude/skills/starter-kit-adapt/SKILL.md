---
name: starter-kit-adapt
description: "Post-fork/clone adaptation guide for the Vue SSR Starter Kit Claude configuration. Trigger when: setting up a new project from this starter, customizing Claude config after fork, updating skill descriptions after dependency changes, removing starter-kit-specific skills, adding project-specific skills/rules/agents, or adapting the agent fleet for a new domain. Don't use for: day-to-day feature work (→ domain skills), Claude config governance rules (→ claude-anthropic), skill authoring workflow (→ skill-creator)."
---

# Starter Kit Adaptation Guide

> Helps new project owners customize the Claude configuration efficiently after forking or cloning the Vue SSR Starter Kit.

## Purpose

When you fork/clone the Vue SSR Starter Kit for a new project, the `.claude/` configuration needs adaptation. This skill provides a structured process to:

- Strip starter-kit specifics that don't apply
- Retain the proven orchestration patterns (hooks, review, audit)
- Add domain-specific knowledge for your new project
- Keep version references accurate

➜ See skill: `claude-anthropic` — for governance rules on skill anatomy and naming.
➜ See skill: `skill-creator` — for the create/eval/iterate workflow when adding new skills.

## Post-fork adaptation checklist

1. **Rename project references in `CLAUDE.md`** — Update project name, description, repository identifier (`e-xode/vue-ssr` → your org/repo), and the commit co-author trailer identity in the Hard rules section (a tool-agnostic placeholder you can replace).

2. **Review and update skill descriptions** — Dependency versions are hardcoded in descriptions (Vue 3.5, Vite 7, Express 5, Vuetify 4, etc.). Update to match your `package.json`.

3. **Remove skills that don't apply** — Delete skill folders and their `CLAUDE.md` index entries. See the table below for guidance.

4. **Add project-specific skills** — Create skills for your domain knowledge (business logic, API integrations, data models). Use `skill-creator`.

5. **Update the agent fleet** — Add/remove agents in `.claude/agents/`. Update the fleet table in `CLAUDE.md`.

6. **Update `.claude/rules/`** — Remove path-scoped rules that don't apply (e.g., `objectid-validation` if no MongoDB). Add rules for your project constraints.

7. **Run `scripts/audit.py`** — Validates that `CLAUDE.md` index, skill descriptions, agent references, and cross-links are consistent.

8. **Update the translate skill** — If your locale set differs (add/remove languages), update the translate skill description and locale file paths.

## What to keep vs customize vs remove

| Keep as-is                                     | Customize                                    | Remove if N/A                                    |
| ---------------------------------------------- | -------------------------------------------- | ------------------------------------------------ |
| `claude-anthropic` skill                       | `vue-ssr-architecture` (your stack)          | `vue-ssr-auth` (if no auth)                      |
| `skill-creator` skill                          | `CLAUDE.md` hard rules                       | Specific rules (`objectid` if no MongoDB)        |
| `vue-ssr-hooks` skill + `hooks` agent          | Agent fleet for your domain                  | `vuetify-components` (if not using Vuetify)      |
| `review` skill + agent                         | `translate` skill (your locales)             | `design-scss` (if different styling approach)    |
| Audit script (`scripts/audit.py`)              | `vue-ssr-deployment` (your CI/CD)            | `vue-ssr-design` (if different UI framework)     |
| `vue-ssr-design` skill (coordination patterns) | `design` agent (adapt for your UI framework) | `design-ux` (if using a different design system) |

## Adapting the design agent post-fork

The `design` agent (`.claude/agents/design.md`) is written for **Vue 3 + Vuetify 4 + SCSS**. If your fork uses a different UI framework:

1. **Same stack (Vuetify)** — keep as-is, only update version references if needed.
2. **Different Vue UI library** (Quasar, PrimeVue, Naive UI) — rewrite the agent body:
   - Replace Vuetify references with your library's component system
   - Update skill references (remove `vuetify-components`, add your library's skill)
   - Keep the sub-agent contract, workflow, and anti-patterns sections intact
3. **Non-Vue framework** (React, Angular, Svelte) — full rewrite needed:
   - Keep the structural template (mission, principles, scope, contract, return format)
   - Replace all Vue/Vuetify content with your framework's conventions
   - Create matching design skills for your framework's patterns

The coordination skill (`vue-ssr-design`) documents the delegation routing — adapt it for your new agent's scope.

## Version-sensitive areas

These locations contain hardcoded dependency versions — update after forking:

| Location                                 | What to check                                               |
| ---------------------------------------- | ----------------------------------------------------------- |
| `vue-ssr-architecture` skill description | Vue, Vite, Express, MongoDB, Vuetify, Pinia versions        |
| `vue-ssr-deployment` skill / references  | Docker base image, Node.js version, GitHub Actions versions |
| `vuetify-components` skill description   | Vuetify major version, Material Design version              |
| `vue3-composition` skill description     | Vue version                                                 |
| `translate` skill description            | `vue-i18n` version                                          |
| `design-scss` skill description          | SCSS tooling versions                                       |
| `design` agent                           | Stack context line (Vue, Vite, Vuetify versions)            |
| `CLAUDE.md` commands section             | npm script names (verify they still exist)                  |

## Adding a new locale

1. Create `src/translate/{code}.json` with all keys from `en.json`
2. Update the `translate` skill description — add the new locale code to the locale list
3. Update route regex in architecture references (`/:locale(en|fr)/` → `/:locale(en|fr|de)/`)
4. The translate agent fleet scales automatically — no agent changes needed
5. Run `audit.py` to verify cross-references

## Extending the agent fleet

**Create a new agent when:**

- A task requires a distinct tool set or model configuration
- Separation of concerns demands isolated context (e.g., security review vs code review)
- A workflow is triggered frequently and benefits from specialization

**Extend an existing agent when:**

- The new capability is a natural extension of an existing agent's scope
- Adding a prompt section is sufficient (no new tools needed)
- The trigger conditions overlap heavily with an existing agent

➜ See reference: `claude-anthropic/references/agent-anatomy.md` — for agent file structure and conventions.

## Detailed reference

For step-by-step walkthroughs, examples, and templates:

➜ See [references/customization-guide.md](./references/customization-guide.md)
