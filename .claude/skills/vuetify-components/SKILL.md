---
name: vuetify-components
description: "Vuetify 4 (Material Design 3) component reference for the Vue SSR Starter Kit (e-xode/vue-ssr). Covers component selection decision tree, project defaults (rounded, variants, density), color palette (primary blue, secondary purple, accent cyan), @mdi/js icon usage patterns, form building with validation rules, v-data-table with server-side pagination, navigation drawers/tabs, feedback dialogs/snackbars/alerts, theming (light/dark), and SSR-safe Vuetify instantiation. Trigger on any Vuetify component question, form building, data table, dialog, snackbar, icon usage, theming, color palette, component props, Vuetify layout, responsive Vuetify patterns, or Material Design 3 usage. Don't use for: app file structure or routing (→ vue-ssr-architecture), auth flow or session logic (→ vue-ssr-auth), SCSS variables or design tokens (→ design-scss), Docker/CI (→ vue-ssr-deployment), post-task validation (→ vue-ssr-hooks)."
---

# Vuetify Components

> Owns all Vuetify 4 component usage knowledge: selection, configuration, patterns, theming, and SSR integration.

## Component selection decision tree

| UI need | Component | Notes |
| --- | --- | --- |
| Text input | `v-text-field` | outlined, comfortable density, rounded lg |
| Dropdown | `v-select` | same defaults as text-field |
| Toggle | `v-switch` | primary color, inset |
| Action button | `v-btn` | flat variant, rounded lg |
| Card container | `v-card` | rounded xl, no elevation, border |
| Data grid | `v-data-table` | server-side pagination preferred |
| Navigation list | `v-list` + `v-list-item` | with prepend icons |
| Tag/badge | `v-chip` | rounded lg |
| Modal | `v-dialog` | max-width, persistent for forms |
| Toast notification | `v-snackbar` | location bottom, timeout 4000 |
| Inline message | `v-alert` | tonal variant, rounded lg |
| Hover info | `v-tooltip` | location bottom |
| Top bar | `v-app-bar` | flat, density comfortable |
| Side menu | `v-navigation-drawer` | temporary on mobile, rail on desktop |
| Context menu | `v-menu` | activator slot pattern |
| Tab navigation | `v-tabs` + `v-tabs-window` | with v-tab items |
| Loading state | `v-progress-linear` / `v-progress-circular` | indeterminate |
| Skeleton | `v-skeleton-loader` | type: card, list-item, article |
| Grid layout | `v-container` + `v-row` + `v-col` | 12-column grid |

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

| Token | Value | Use |
| --- | --- | --- |
| `primary` | #2563eb | Main actions, links, active states |
| `primary-darken-1` | #1e40af | Hover states |
| `primary-darken-2` | #1e3a8a | Active/pressed states |
| `primary-lighten-1` | #60a5fa | Subtle backgrounds |
| `primary-lighten-2` | #93c5fd | Very subtle backgrounds |
| `secondary` | #7c3aed | Secondary actions |
| `accent` | #06b6d4 | Highlights, accents |
| `success` | #00c853 | Success states |
| `warning` | #ff9800 | Warning states |
| `error` | #f44336 | Error states, destructive |
| `info` | #2196f3 | Informational |
| `surface` | #ffffff | Card/sheet backgrounds |
| `background` | #f8fafc | Page background |

Use semantic color names in components: `color="primary"`, `color="error"`, etc. Never hardcode hex values.

## Icon usage

The project uses `@mdi/js` for tree-shakeable SVG icons:

```vue
<script setup>
import { mdiAccount, mdiEmail, mdiLock } from '@mdi/js'
</script>
<template>
  <v-icon :icon="mdiAccount" />
  <v-btn :prepend-icon="mdiEmail">Send</v-btn>
  <v-text-field :append-inner-icon="mdiLock" />
</template>
```

Never use icon font classes (`mdi-account`). Always import from `@mdi/js`.

See [references/icons.md](./references/icons.md) for the full icon catalog.

## Form pattern

```vue
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const form = ref(null)
const email = ref('')

const rules = {
  required: v => !!v || t('validation.required'),
  email: v => /.+@.+\..+/.test(v) || t('validation.email')
}

async function submit() {
  const { valid } = await form.value.validate()
  if (!valid) return
}
</script>
<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-text-field v-model="email" :rules="[rules.required, rules.email]" />
    <v-btn type="submit" color="primary">{{ t('actions.submit') }}</v-btn>
  </v-form>
</template>
```

See [references/form-components.md](./references/form-components.md) for detailed form patterns.

## SSR integration

Vuetify must be instantiated with the `ssr` flag on the server:

```javascript
import { createApplicationVuetify } from '@/plugins/vuetify'

const vuetify = createApplicationVuetify(true)
app.use(vuetify)
```

On the client, pass `false` (or omit):

```javascript
const vuetify = createApplicationVuetify(false)
```

This ensures hydration works correctly. The SSR flag disables client-only features during server rendering.

## Responsive patterns

Use Vuetify's display composable for breakpoint-aware behavior:

```vue
<script setup>
import { useDisplay } from 'vuetify'

const { mobile, mdAndUp } = useDisplay()
</script>
<template>
  <v-navigation-drawer :temporary="mobile" :rail="mdAndUp" />
</template>
```

Breakpoints: xs (<600), sm (600-959), md (960-1279), lg (1280-1919), xl (1920+).

## References

| File | Content |
| --- | --- |
| [form-components.md](./references/form-components.md) | Text fields, selects, switches, validation, form patterns |
| [data-display.md](./references/data-display.md) | Cards, data tables, lists, chips, avatars, pagination |
| [navigation.md](./references/navigation.md) | App bar, drawer, menu, tabs, breadcrumbs, responsive |
| [feedback.md](./references/feedback.md) | Dialogs, snackbars, alerts, tooltips, progress, skeletons |
| [theming.md](./references/theming.md) | Theme config, dark mode, defaults, CSS utilities |
| [icons.md](./references/icons.md) | MDI icon imports, common icons, aliases |
