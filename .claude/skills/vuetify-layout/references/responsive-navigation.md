# Responsive navigation patterns

## Mobile drawer + desktop tabs

```vue
<script setup>
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();
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

## Bottom navigation for mobile

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
