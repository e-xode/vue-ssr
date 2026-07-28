---
name: vuetify-components
description: "Vuetify 4 general display and feedback components for the Vue SSR Starter Kit: containers and content (v-card, v-list, v-chip, v-avatar), overlays and feedback (v-dialog and the reusable confirm-dialog pattern, v-snackbar, v-alert, v-tooltip), and loading indicators. Trigger on: building cards, lists, chips, avatars, dialogs/modals, snackbars, alerts, tooltips, progress, or skeleton loaders. Don't use for: form inputs (→ vuetify-forms), data tables/pagination (→ vuetify-data), app shell/navigation/tabs (→ vuetify-layout), component selection overview and defaults (→ vuetify-overview), theming (→ vuetify-theming), icons (→ vuetify-icons), Vue-level Teleport/Suspense/Transition (→ vue3-builtin-components)."
---

# Display and Feedback Components

## Component selection

| Need                              | Component                                  | Project default                          |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Grouped content container          | `v-card`                                    | `rounded="lg"`, `elevation="0"`, `border`  |
| Navigation/action list             | `v-list` + `v-list-item`                    | —                                            |
| Tag/status badge                    | `v-chip`                                    | `rounded="lg"`                              |
| User avatar                        | `v-avatar`                                  | —                                            |
| Modal / confirmation               | `v-dialog`                                  | `max-width`, `persistent` for forms          |
| Toast notification                 | `v-snackbar`                                | `location="bottom"`, `timeout="4000"`        |
| Inline message                     | `v-alert`                                   | `rounded="lg"`, `variant="tonal"`            |
| Hover info                         | `v-tooltip`                                 | `location="bottom"`                         |
| Linear/circular loading state       | `v-progress-linear` / `v-progress-circular` | `indeterminate`                              |
| Content placeholder while loading   | `v-skeleton-loader`                         | `type="card"` / `"list-item"` / `"article"`  |

## Hard rules

- **`v-card`'s project default is `rounded="lg"`**, not `"xl"` — verify against `vuetify-theming` before repeating it elsewhere.
- **Reuse the confirm-dialog composable pattern** (`references/overlays-feedback.md`) for any destructive-action confirmation instead of hand-rolling a bespoke modal per view.
- **Feedback colors come from semantic tokens** (`success`/`warning`/`error`/`info`, owned by `vuetify-theming`) — never invent an ad hoc hex for a chip, alert, or snackbar color.

## Reference files

| Need                                                          | File                                  |
| -------------------------------------------------------------- | --------------------------------------- |
| `v-card`, `v-list`/`v-list-item`, `v-chip`, `v-avatar`          | `references/containers-content.md`      |
| `v-dialog` + confirm-dialog pattern, `v-snackbar`, `v-alert`, `v-tooltip` | `references/overlays-feedback.md` |
| `v-progress-linear`, `v-progress-circular`, `v-skeleton-loader` | `references/loading-indicators.md`      |
