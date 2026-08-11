# Application shell: grid, app bar, navigation drawer

## Grid layout

The 12-column grid uses `v-container` + `v-row` + `v-col`. `v-container` centers and pads content, `v-row` creates a flex row, and each `v-col` spans columns out of 12 (with responsive breakpoint props like `cols`, `sm`, `md`, `lg`):

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <MainContent />
      </v-col>
      <v-col cols="12" md="4">
        <Sidebar />
      </v-col>
    </v-row>
  </v-container>
</template>
```

## v-app-bar

Top application bar.

### Standard pattern

```vue
<script setup>
import { mdiMenu, mdiAccount } from '@mdi/js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['toggle-drawer']);
</script>
<template>
  <v-app-bar flat density="comfortable">
    <v-app-bar-nav-icon @click="emit('toggle-drawer')">
      <v-icon :icon="mdiMenu" />
    </v-app-bar-nav-icon>

    <v-app-bar-title>{{ t('app.title') }}</v-app-bar-title>

    <v-spacer />

    <v-btn :icon="mdiAccount" variant="text" />
  </v-app-bar>
</template>
```

### Key props

| Prop               | Type    | Description                            |
| -------------------- | ------- | ------------------------------------------ |
| `flat`             | boolean | No shadow                                    |
| `density`          | string  | default, comfortable, compact                  |
| `color`            | string  | Background color                                 |
| `scroll-behavior`  | string  | hide, elevate, collapse, fade-image                |
| `scroll-threshold` | number  | Pixels before behavior triggers                       |
| `fixed`            | boolean | Fixed position                                          |
| `prominent`        | boolean | Taller bar                                                |

## v-navigation-drawer

Side navigation panel. Responsive patterns differ by device.

### Responsive drawer pattern

```vue
<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
const drawer = ref(true);
</script>
<template>
  <v-navigation-drawer
    v-model="drawer"
    :temporary="mobile"
    :rail="!mobile"
    :expand-on-hover="!mobile"
  >
    <v-list nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
      />
    </v-list>
  </v-navigation-drawer>
</template>
```

### Key props

| Prop              | Type    | Description                    |
| ------------------- | ------- | --------------------------------- |
| `v-model`         | boolean | Show/hide                          |
| `temporary`       | boolean | Overlays content (mobile)            |
| `rail`            | boolean | Collapsed to icons only               |
| `expand-on-hover` | boolean | Expands rail on hover                    |
| `permanent`       | boolean | Always visible                              |
| `location`        | string  | start (left) or end (right)                   |
| `width`           | number  | Drawer width in px                              |
| `rail-width`      | number  | Rail mode width                                    |
