---
name: vuetify-overview
description: "Vuetify 4 (Material Design 3) entry point and global configuration for the Vue SSR Starter Kit: component selection decision tree (which v-component for which UI need), project-wide defaults in src/plugins/vuetify.js (rounded, variants, density per component), the semantic color palette (primary/secondary/accent/success/warning/error), SSR-safe instantiation (createApplicationVuetify(ssr) flag), and responsive breakpoints via the useDisplay composable. Trigger on: choosing which Vuetify component to use, project default props, color tokens by name, SSR Vuetify setup, useDisplay/breakpoint behavior, or a general 'which Vuetify component' question. Don't use for: specific component APIs — forms (→ vuetify-forms), data tables (→ vuetify-data), cards/dialogs/alerts (→ vuetify-components), app-bar/drawer/tabs (→ vuetify-layout), theming/dark mode (→ vuetify-theming), icons (→ vuetify-icons), SCSS tokens (→ design-scss)."
---

# Vuetify Overview

> Entry point for all Vuetify 4 usage in the Vue SSR Starter Kit: component selection, project defaults, color tokens, SSR setup, and responsive breakpoints.

## Vuetify skill family

This skill is the entry point. Specific component APIs and patterns live in sibling skills:

- **vuetify-theming** — theme config, dark mode, defaults object, Vuetify CSS utility classes
- **vuetify-layout** — app shell, grid, app bar, navigation drawer, menus, tabs, breadcrumbs
- **vuetify-forms** — inputs, validation rules, v-form wrapper, form submission
- **vuetify-data** — data tables (server-side pagination), v-pagination
- **vuetify-components** — cards, lists, chips, avatars, dialogs, snackbars, alerts, tooltips, progress, skeletons
- **vuetify-icons** — @mdi/js tree-shakeable SVG icons

## Component selection decision tree

| UI need            | Component                                   | Notes                                     |
| ------------------ | ------------------------------------------- | ----------------------------------------- |
| Text input         | `v-text-field`                              | outlined, comfortable density, rounded lg |
| Dropdown           | `v-select`                                  | same defaults as text-field               |
| Toggle             | `v-switch`                                  | primary color, inset                      |
| Action button      | `v-btn`                                     | flat variant, rounded lg                  |
| Card container     | `v-card`                                    | rounded xl, no elevation, border          |
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

The project configures global defaults in `src/plugins/vuetify.js`:

```javascript
defaults: {
  VBtn: { variant: 'flat', rounded: 'lg' },
  VCard: { rounded: 'xl', elevation: 0, border: true },
  VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
  VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
  VSwitch: { color: 'primary', inset: true },
  VChip: { rounded: 'lg' },
  VAlert: { rounded: 'lg', variant: 'tonal' },
  VTooltip: { location: 'bottom' }
}
```

These apply globally. Override per-instance when needed (e.g. `<v-btn variant="outlined">`).

## Color system

| Token               | Value   | Use                                |
| ------------------- | ------- | ---------------------------------- |
| `primary`           | #2563eb | Main actions, links, active states |
| `primary-darken-1`  | #1e40af | Hover states                       |
| `primary-darken-2`  | #1e3a8a | Active/pressed states              |
| `primary-lighten-1` | #60a5fa | Subtle backgrounds                 |
| `primary-lighten-2` | #93c5fd | Very subtle backgrounds            |
| `secondary`         | #7c3aed | Secondary actions                  |
| `accent`            | #06b6d4 | Highlights, accents                |
| `success`           | #00c853 | Success states                     |
| `warning`           | #ff9800 | Warning states                     |
| `error`             | #f44336 | Error states, destructive          |
| `info`              | #2196f3 | Informational                      |
| `surface`           | #ffffff | Card/sheet backgrounds             |
| `background`        | #f8fafc | Page background                    |

Use semantic color names in components: `color="primary"`, `color="error"`, etc. Never hardcode hex values.

## SSR integration

Vuetify must be instantiated with the `ssr` flag on the server:

```javascript
import { createApplicationVuetify } from '@/plugins/vuetify';

const vuetify = createApplicationVuetify(true);
app.use(vuetify);
```

On the client, pass `false` (or omit):

```javascript
const vuetify = createApplicationVuetify(false);
```

This ensures hydration works correctly. The SSR flag disables client-only features during server rendering.

## Responsive patterns

Use Vuetify's display composable for breakpoint-aware behavior:

```vue
<script setup>
import { useDisplay } from 'vuetify';

const { mobile, mdAndUp } = useDisplay();
</script>
<template>
  <v-navigation-drawer :temporary="mobile" :rail="mdAndUp" />
</template>
```

Breakpoints: xs (<600), sm (600-959), md (960-1279), lg (1280-1919), xl (1920+).
