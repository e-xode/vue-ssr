---
name: vue-ssr-design
description: "Design delegation and coordination reference for the Vue SSR Starter Kit: when to delegate to the design agent vs handle styling inline, division of concerns between design agent and design-ux/design-scss/vuetify-components skills, design workflow for new features (design-first → implement → validate), starter-kit design principles (clean, minimal, customizable, Material Design 3). Trigger on: deciding whether a task needs the design agent, planning UI work that mixes logic and design, new feature design direction, design-system extension decisions, visual debt triage. Don't use for: actual SCSS implementation (→ design-scss), UX methodology (→ design-ux), Vuetify component API (→ vuetify-components), Vue logic (→ vue3-composition), app architecture (→ vue-ssr-architecture)."
---

# Vue SSR Design (Coordination)

> Owns the **routing logic** for design work: when to delegate, how to split tasks, and the design philosophy of the starter kit.

## When to delegate to the `design` agent

Delegate to the `design` agent when a task is **primarily** about visual output:

| Delegate to `design` | Handle inline (orchestrator) |
|---|---|
| Creating/revamping a full view layout | Adding a single `v-btn` to an existing template |
| Responsive redesign of a component | A one-line SCSS token change |
| Accessibility audit of a page | Fixing a linter warning in `.scss` |
| Vuetify theming changes (colors, defaults) | Changing a prop value on a Vuetify component |
| New design-system tokens/mixins | Reading existing tokens for reference |
| Complex animations or transitions | Adding a simple `class="animate-fade-up"` |
| Visual polish pass (spacing, alignment, shadows) | — |

**Rule of thumb:** If you need to read `design-ux` or `design-scss` skills to do the work, delegate to the `design` agent instead.

## Division of concerns

```
┌──────────────────────────────────────────────────────────┐
│  Orchestrator (main agent)                                │
│  • Decides WHAT to build (requirements, scope)            │
│  • Routes design work to design agent                     │
│  • Routes logic work to vue agent                         │
│  • Routes i18n to translate agent                         │
│  • Delegates validation to hooks agent                    │
└──────────────┬────────────────────────────────────────────┘
               │ delegates
┌──────────────▼────────────────────────────────────────────┐
│  Design agent                                              │
│  • HOW it looks (visual decisions)                         │
│  • SCSS files (create/edit)                                │
│  • Vuetify component selection and configuration           │
│  • Template markup for visual structure                    │
│  • Loads skills: design-ux, design-scss, vuetify-components│
└───────────────────────────────────────────────────────────┘
```

### Skill vs Agent distinction

| Layer | Role |
|---|---|
| `design-ux` skill | **Methodology** — principles, hierarchy, spacing rules, accessibility requirements |
| `design-scss` skill | **Implementation reference** — tokens, mixins, animation classes, file patterns |
| `vuetify-components` skill | **Component API** — which component for which need, props, patterns |
| `design` agent | **Executor** — applies skills to produce actual code changes |

Skills are **knowledge**. The agent is the **worker** that uses that knowledge.

## Design workflow for new features

1. **Design direction** (orchestrator) — define the goal, user story, expected outcome
2. **Delegate to `design` agent** — provide context: what view/component, what the user wants, existing patterns to follow
3. **Design agent produces** — SCSS file + template updates, following design-ux/design-scss/vuetify-components skills
4. **Parallel: `vue` agent** — handles `<script setup>` logic, composables, store integration
5. **Parallel: `translate` agent** — adds i18n keys for any new user-visible text
6. **Integration** (orchestrator) — merge outputs if needed
7. **Validation** — delegate to `hooks` agent

Steps 3, 4, and 5 can run in parallel when scopes don't overlap.

## Starter-kit design philosophy

This is a **starter kit** — design choices must be:

1. **Clean and minimal** — no opinionated branding, easily customizable after fork
2. **Material Design 3 native** — lean into Vuetify 4's MD3 system, don't fight it
3. **Token-driven** — all visual decisions expressed as variables, easy to swap
4. **Responsive by default** — every component works xs → xl out of the box
5. **Accessible first** — WCAG 2.1 AA minimum, no accessibility debt for forks
6. **Dark-mode ready** — Vuetify handles theming, but custom SCSS must respect both modes

## Splitting mixed tasks

When a user request involves both design and logic:

```
"Create a user profile page with avatar upload, form validation, and responsive layout"

Split:
├── design agent: layout, SCSS, Vuetify component selection, responsive grid
├── vue agent: <script setup>, form validation logic, file upload composable, store
├── translate agent: i18n keys for all labels
└── hooks agent: validation at the end
```

## Design debt tracking

When the design agent reports follow-ups or debt, categorize:

| Type | Action |
|---|---|
| Missing dark-mode support | Schedule as follow-up task |
| Hardcoded spacing found in existing code | Note for refactoring pass |
| Accessibility gap (missing aria, low contrast) | Fix immediately (non-negotiable) |
| Inconsistent token usage across views | Schedule design-system cleanup |

## See also

- `.claude/agents/design.md` — the design agent's full contract and principles
- `.claude/skills/design-ux/SKILL.md` — UX methodology and decision frameworks
- `.claude/skills/design-scss/SKILL.md` — SCSS token and mixin reference
- `.claude/skills/vuetify-components/SKILL.md` — Vuetify 4 component patterns
