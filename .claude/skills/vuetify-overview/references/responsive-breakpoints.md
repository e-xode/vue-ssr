# Responsive breakpoints (useDisplay)

Use Vuetify's display composable for breakpoint-aware behavior in script/template:

```vue
<script setup>
import { useDisplay } from 'vuetify';

const { mobile, mdAndUp } = useDisplay();
</script>
<template>
  <v-navigation-drawer :temporary="mobile" :rail="mdAndUp" />
</template>
```

## Breakpoint values

| Name | Range        |
| ---- | ------------- |
| `xs` | < 600px        |
| `sm` | 600–959px      |
| `md` | 960–1279px     |
| `lg` | 1280–1919px    |
| `xl` | ≥ 1920px       |

## Do not conflate with the SCSS breakpoint scale

These are Vuetify's own JS breakpoints, used by `useDisplay` and Vuetify's internal responsive props (`cols`, `sm`, `md`, `lg` on `v-col`, etc.). The SCSS `respond-to()` mixin (owned by `design-scss`) uses a **different** breakpoint scale for hand-written CSS. A component whose layout must behave consistently whether driven from script (`useDisplay`) or from `.scss` needs both checked explicitly — do not assume `md` means the same pixel threshold in both systems.
