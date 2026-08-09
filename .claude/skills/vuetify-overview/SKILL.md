---
name: vuetify-overview
description: "Vuetify 4 (Material Design 3) entry point and global configuration for the Vue SSR Starter Kit: the component-selection decision tree, project-wide defaults in src/plugins/vuetify.js, the semantic color palette, SSR-safe instantiation, and responsive breakpoints via useDisplay. Trigger on: choosing which Vuetify component to use, project default props, color tokens by name, SSR Vuetify setup, useDisplay/breakpoint behavior, or a general 'which Vuetify component' question. Don't use for: specific component APIs — forms (→ vuetify-forms), data tables (→ vuetify-data), cards/dialogs/alerts (→ vuetify-components), app-bar/drawer/tabs (→ vuetify-layout), theming/dark mode (→ vuetify-theming), icons (→ vuetify-icons), SCSS tokens (→ design-scss)."
---

# Vuetify Overview

> Entry point for all Vuetify 4 usage in the Vue SSR Starter Kit: component selection, project defaults, color tokens, SSR setup, and responsive breakpoints.

## Vuetify skill family

This skill is the entry point. Specific component APIs and patterns live in sibling skills:

- **vuetify-theming** — hex color values (single owner), theme config, dark mode, defaults object, Vuetify CSS utility classes
- **vuetify-layout** — app shell, grid, app bar, navigation drawer, menus, tabs, breadcrumbs
- **vuetify-forms** — inputs, validation rules, v-form wrapper, form submission
- **vuetify-data** — data tables (server-side pagination), v-pagination
- **vuetify-components** — cards, lists, chips, avatars, dialogs, snackbars, alerts, tooltips, progress, skeletons
- **vuetify-icons** — @mdi/js tree-shakeable SVG icons

## Division of responsibilities (color)

| Skill                | Owns                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `vuetify-theming`     | Every hex value, single source of truth (its `references/color-palette.md`) |
| **vuetify-overview**  | Which semantic token name fits a given intent (this page's table below) |

## Component selection decision tree

| UI need            | Component                                   | Notes                                     |
| ------------------- | -------------------------------------------- | ------------------------------------------ |
| Text input         | `v-text-field`                              | outlined, comfortable density, rounded lg |
| Dropdown           | `v-select`                                  | same defaults as text-field               |
| Toggle             | `v-switch`                                  | primary color, inset                      |
| Action button      | `v-btn`                                     | flat variant, rounded lg                  |
| Card container     | `v-card`                                    | rounded lg, no elevation, border          |
| Data grid          | `v-data-table`                              | server-side pagination preferred          |
| Navigation list    | `v-list` + `v-list-item`                    | with prepend icons                        |
| Tag/badge          | `v-chip`                                    | rounded lg                                |
| Modal              | `v-dialog`                                  | max-width, persistent for forms           |
| Toast notification | `v-snackbar`                                | location bottom, timeout 4000             |
| Inline message     | `v-alert`                                   | tonal variant, rounded lg                 |
| Hover info         | `v-tooltip`                                 | location bottom                           |
| Top bar            | `v-app-bar`                                 | flat, density comfortable                 |
| Side menu          | `v-navigation-drawer`                       | temporary on mobile, rail on desktop      |
| Context menu       | `v-menu`                                    | activator slot pattern                    |
| Tab navigation     | `v-tabs` + `v-tabs-window`                  | with v-tab items                          |
| Loading state      | `v-progress-linear` / `v-progress-circular` | indeterminate                             |
| Skeleton           | `v-skeleton-loader`                         | type: card, list-item, article            |
| Grid layout        | `v-container` + `v-row` + `v-col`           | 12-column grid                            |

## Project defaults

Global component defaults (`VBtn`, `VCard`, `VTextField`, etc.) are configured once in `src/plugins/vuetify.js` and owned by `vuetify-theming` — see its "Project defaults" table for the full list, or the decision tree above for the default relevant to a specific component.

## Semantic color tokens by intent

| Intent                    | Token       |
| --------------------------- | ------------ |
| Main actions, links, active state | `primary`  |
| Secondary actions            | `secondary`  |
| Highlights/accents           | `accent`     |
| Success feedback             | `success`    |
| Warning feedback             | `warning`    |
| Error, destructive           | `error`      |
| Informational                | `info`       |
| Card/sheet background        | `surface`    |
| Page background               | `background` |

Use semantic color names in components: `color="primary"`, `color="error"`, etc. Never hardcode hex values — see `vuetify-theming` for the underlying hex.

## Hard rules

- **`VCard`'s project default is `rounded: 'lg'`**, not `'xl'` — this is the single most-cited fact from this skill family; verify against `vuetify-theming`'s reference before repeating it.
- **`vuetify-theming` is the doc home for hex values** (the code source of truth is `src/plugins/vuetify.js`) — this skill only names tokens, never redefines their color.
- **Two different breakpoint scales exist — never conflate them.** Vuetify's `useDisplay` JS breakpoints (`xs`<600, `sm` 600–959, `md` 960–1279, `lg` 1280–1919, `xl` 1920+) are unrelated to the SCSS `respond-to()` mixin's breakpoints (owned by `design-scss`). A layout that must behave consistently in both JS and SCSS needs both checked explicitly — they do not share thresholds.

## Reference files

| Need                                            | File                                  |
| ------------------------------------------------ | --------------------------------------- |
| SSR-safe instantiation (`createApplicationVuetify`) | `references/ssr-integration.md`        |
| `useDisplay` breakpoint values and responsive code patterns | `references/responsive-breakpoints.md` |
