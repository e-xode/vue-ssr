---
name: vue-ssr-design
description: "Design delegation and coordination reference for the Vue SSR Starter Kit: when to delegate to the design agent vs handle styling inline, the division of concerns between the design agent and the design/vuetify skills, the design workflow for new features, and the starter-kit design principles. Trigger on: deciding whether a task needs the design agent, planning UI work that mixes logic and design, new feature design direction, design-system extension decisions, visual debt triage. Don't use for: actual SCSS implementation (→ design-scss), UX methodology (→ design-ux), Vuetify component API (→ vuetify-components), Vue logic (→ vue3-composition), app architecture (→ vue-ssr-architecture)."
---

# Vue SSR Design (Coordination)

> Owns the **routing logic** for design work: when to delegate, how to split tasks, and the design philosophy of the starter kit.

## When to delegate to the `design` agent

Delegate to the `design` agent when a task is **primarily** about visual output:

| Delegate to `design`                             | Handle inline (orchestrator)                    |
| ------------------------------------------------ | ----------------------------------------------- |
| Creating/revamping a full view layout            | Adding a single `v-btn` to an existing template |
| Responsive redesign of a component               | A one-line SCSS token change                    |
| Accessibility audit of a page                    | Fixing a linter warning in `.scss`              |
| Vuetify theming changes (colors, defaults)       | Changing a prop value on a Vuetify component    |
| New design-system tokens/mixins                  | Reading existing tokens for reference           |
| Complex animations or transitions                | A one-line `@include transition(...)` in the component's own SCSS file |
| Visual polish pass (spacing, alignment, shadows) | —                                               |

**Rule of thumb:** If you need to read `design-ux` or `design-scss` skills to do the work, delegate to the `design` agent instead.

## Division of concerns

```
┌──────────────────────────────────────────────────────────┐
│  Orchestrator (main agent)                                │
│  • Decides WHAT to build (requirements, scope)            │
│  • Routes design work to design agent                     │
│  • Routes logic work to vue agent                         │
│  • Routes i18n to translate agent                         │
│  • Delegates validation to `validation` agent             │
└──────────────┬────────────────────────────────────────────┘
               │ delegates
┌──────────────▼────────────────────────────────────────────┐
│  Design agent                                              │
│  • HOW it looks (visual decisions)                         │
│  • SCSS files (create/edit)                                │
│  • Vuetify component selection and configuration           │
│  • Template markup for visual structure                    │
│  • Loads skills: design-ux, design-scss, vuetify-* family  │
└───────────────────────────────────────────────────────────┘
```

### Skill vs Agent distinction

| Layer                      | Role                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `brand-art-direction` skill | **Opinionated brand-identity charter** — loads first; the screenshot-verifiable rubric `visual-qa` grades against |
| `design-ux` skill          | **Methodology** — principles, hierarchy, spacing rules, accessibility requirements |
| `design-scss` skill        | **Implementation reference** — tokens, mixins, component-scoped file patterns (animation/utility classes are inert — see `design-scss`) |
| `vuetify-*` skill family   | **Component API** — which component for which need, props, patterns; enter via `vuetify-overview`, then vuetify-layout/forms/data/components/theming/icons |
| `design` agent             | **Executor** — applies skills to produce actual code changes                       |

Skills are **knowledge**. The agent is the **worker** that uses that knowledge.

## Design workflow for new features

1. **Design direction** (orchestrator) — define the goal, user story, expected outcome
2. **Delegate to `design` agent** — provide context: what view/component, what the user wants, existing patterns to follow
3. **Design agent produces** — SCSS file + template updates, following design-ux/design-scss and the vuetify-* skill family (enter via vuetify-overview)
4. **Parallel: `vue` agent** — handles `<script setup>` logic, composables, store integration
5. **Parallel: `translate` agent** — adds i18n keys for any new user-visible text
6. **Integration** (orchestrator) — merge outputs if needed
7. **Validation** — delegate to `validation` agent

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
└── validation agent: validation at the end
```

## Design debt tracking

When the design agent reports follow-ups or debt, categorize:

| Type                                           | Action                           |
| ---------------------------------------------- | -------------------------------- |
| Missing dark-mode support                      | Schedule as follow-up task       |
| Hardcoded spacing found in existing code       | Note for refactoring pass        |
| Accessibility gap (missing aria, low contrast) | Fix immediately (non-negotiable) |
| Inconsistent token usage across views          | Schedule design-system cleanup   |

## See also

- `design` agent — the design agent's full contract and principles (`.claude/agents/design.md`).
➜ See skill: brand-art-direction — the opinionated brand-identity charter; loads before design-ux/design-scss for any visual work on rendered views.
➜ See skill: design-ux — UX methodology and decision frameworks.
➜ See skill: design-scss — SCSS token and mixin reference.
➜ See skill: vuetify-overview — entry point for the vuetify-* skill family (vuetify-overview, vuetify-layout, vuetify-forms, vuetify-data, vuetify-components, vuetify-theming, vuetify-icons) covering Vuetify 4 component patterns.
