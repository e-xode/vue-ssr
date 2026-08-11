---
name: vuetify-icons
description: "Vuetify 4 iconography for the Vue SSR Starter Kit using @mdi/js tree-shakeable SVG icons: importing named icon paths (mdiAccount, mdiEmail, ...), binding via :icon / prepend-icon / append-inner-icon, the common-icon catalog, and why icon font classes (mdi-account) are forbidden. Trigger on: adding an icon, importing from @mdi/js, icon props on buttons/fields, or the icon catalog. Don't use for: component selection (→ vuetify-overview), theming (→ vuetify-theming), form/field APIs beyond the icon prop (→ vuetify-forms), SCSS (→ design-scss)."
---

# Icons

## Icon usage

The project uses `@mdi/js` for tree-shakeable SVG icons: import the named path, bind it via a prop.

```vue
<script setup>
import { mdiAccount, mdiEmail } from '@mdi/js';
</script>
<template>
  <v-icon :icon="mdiAccount" />
  <v-btn :prepend-icon="mdiEmail">Send</v-btn>
</template>
```

## Prop selection

| Where you need an icon         | Prop                  | Host component            |
| ------------------------------- | --------------------- | -------------------------- |
| Standalone icon                 | `:icon`                | `v-icon`                   |
| Icon-only button                | `:icon`                | `v-btn`                     |
| Leading icon on a button        | `:prepend-icon`        | `v-btn`, `v-chip`, `v-tab`  |
| Trailing icon on a button       | `:append-icon`         | `v-btn`                     |
| Leading icon inside an input    | `:prepend-inner-icon`  | `v-text-field`              |
| Trailing icon inside an input   | `:append-inner-icon`   | `v-text-field`              |
| List item icon                  | `:prepend-icon`        | `v-list-item`               |

Full worked examples per component: `references/usage-examples.md`.

## Hard rules

- Always import icon paths from `@mdi/js` and bind them dynamically (`:icon="mdiAccount"`). Never use icon font class strings (`"mdi-account"`) — the font is not registered; a string name renders nothing.
- Import names are the camelCase icon name prefixed with `mdi` (`account-circle` → `mdiAccountCircle`, `file-document-outline` → `mdiFileDocumentOutline`).
- Default size is correct for nearly all UI; only override `size` for avatars, decorative/hero icons, or small inline indicators — see the sizing guide in `references/icon-catalog.md`.

## Reference files

| Need                                                          | File                              |
| -------------------------------------------------------------- | ---------------------------------- |
| Full code samples (v-icon, v-btn, v-text-field, v-list-item, v-chip, v-tab) | `references/usage-examples.md`     |
| Common project icon names, finding new icons, sizing guide     | `references/icon-catalog.md`       |
