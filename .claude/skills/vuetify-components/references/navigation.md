# Navigation Components

## v-app-bar

Top application bar.

### Standard pattern

```vue
<script setup>
import { mdiMenu, mdiAccount } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['toggle-drawer'])
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

| Prop | Type | Description |
| --- | --- | --- |
| `flat` | boolean | No shadow |
| `density` | string | default, comfortable, compact |
| `color` | string | Background color |
| `scroll-behavior` | string | hide, elevate, collapse, fade-image |
| `scroll-threshold` | number | Pixels before behavior triggers |
| `fixed` | boolean | Fixed position |
| `prominent` | boolean | Taller bar |

## v-navigation-drawer

Side navigation panel. Responsive patterns differ by device.

### Responsive drawer pattern

```vue
<script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const drawer = ref(true)
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

| Prop | Type | Description |
| --- | --- | --- |
| `v-model` | boolean | Show/hide |
| `temporary` | boolean | Overlays content (mobile) |
| `rail` | boolean | Collapsed to icons only |
| `expand-on-hover` | boolean | Expands rail on hover |
| `permanent` | boolean | Always visible |
| `location` | string | start (left) or end (right) |
| `width` | number | Drawer width in px |
| `rail-width` | number | Rail mode width |

## v-menu

Context menus and dropdowns.

### Activator pattern

```vue
<script setup>
import { mdiDotsVertical, mdiPencil, mdiDelete, mdiContentCopy } from '@mdi/js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <v-menu location="bottom end" :offset="4">
    <template #activator="{ props }">
      <v-btn :icon="mdiDotsVertical" variant="text" v-bind="props" />
    </template>
    <v-list density="compact">
      <v-list-item :prepend-icon="mdiPencil" :title="t('actions.edit')" @click="edit()" />
      <v-list-item :prepend-icon="mdiContentCopy" :title="t('actions.duplicate')" @click="duplicate()" />
      <v-divider />
      <v-list-item :prepend-icon="mdiDelete" :title="t('actions.delete')" base-color="error" @click="remove()" />
    </v-list>
  </v-menu>
</template>
```

### Key props

| Prop | Type | Description |
| --- | --- | --- |
| `location` | string | top, bottom, start, end (combinable) |
| `offset` | number/array | Offset from activator |
| `close-on-content-click` | boolean | Close when item clicked (default true) |
| `open-on-hover` | boolean | Open on hover |
| `transition` | string | Transition animation |

## v-tabs + v-tabs-window

Tabbed navigation for content sections.

### Standard tab pattern

```vue
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiAccount, mdiLock, mdiBell } from '@mdi/js'

const { t } = useI18n()
const activeTab = ref('profile')
</script>
<template>
  <v-tabs v-model="activeTab" color="primary">
    <v-tab value="profile" :prepend-icon="mdiAccount">
      {{ t('tabs.profile') }}
    </v-tab>
    <v-tab value="security" :prepend-icon="mdiLock">
      {{ t('tabs.security') }}
    </v-tab>
    <v-tab value="notifications" :prepend-icon="mdiBell">
      {{ t('tabs.notifications') }}
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="activeTab">
    <v-tabs-window-item value="profile">
      <ProfileSection />
    </v-tabs-window-item>
    <v-tabs-window-item value="security">
      <SecuritySection />
    </v-tabs-window-item>
    <v-tabs-window-item value="notifications">
      <NotificationsSection />
    </v-tabs-window-item>
  </v-tabs-window>
</template>
```

### Key props (v-tabs)

| Prop | Type | Description |
| --- | --- | --- |
| `v-model` | string/number | Active tab |
| `color` | string | Active tab indicator color |
| `grow` | boolean | Tabs fill available space |
| `center-active` | boolean | Center the active tab |
| `show-arrows` | boolean | Show scroll arrows |
| `align-tabs` | string | start, center, end, title |
| `density` | string | default, comfortable, compact |

## v-breadcrumbs

Hierarchical navigation path.

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '@/composables/useLocalePath'

const { t } = useI18n()
const localePath = useLocalePath()

const breadcrumbs = computed(() => [
  { title: t('nav.home'), to: localePath('/'), disabled: false },
  { title: t('nav.admin'), to: localePath('/admin'), disabled: false },
  { title: t('nav.users'), disabled: true }
])
</script>
<template>
  <v-breadcrumbs :items="breadcrumbs" />
</template>
```

## Responsive navigation patterns

### Mobile drawer + desktop tabs

```vue
<script setup>
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
</script>
<template>
  <v-navigation-drawer v-if="mobile" v-model="drawer" temporary>
    <NavigationList />
  </v-navigation-drawer>

  <v-tabs v-else color="primary">
    <v-tab v-for="item in navItems" :key="item.to" :to="item.to">
      {{ item.title }}
    </v-tab>
  </v-tabs>
</template>
```

### Bottom navigation for mobile

```vue
<template>
  <v-bottom-navigation v-if="mobile" v-model="activeRoute" grow>
    <v-btn v-for="item in navItems" :key="item.to" :value="item.to" :to="item.to">
      <v-icon :icon="item.icon" />
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>
```
