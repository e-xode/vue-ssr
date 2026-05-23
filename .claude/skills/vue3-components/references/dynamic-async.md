# Dynamic & Async Components

## Registration: local vs global

Prefer **local registration** — import the component in `<script setup>` and use it. This enables tree-shaking and makes dependencies explicit.

```vue
<script setup>
import UserCard from './UserCard.vue';
</script>

<template>
  <UserCard :user="user" />
</template>
```

Global registration (`app.component(...)`) is used only for app-wide primitives. In this project **Vuetify components are registered globally** by the Vuetify plugin — `<v-btn>`, `<v-card>`, etc. need no import.

➜ See skill: vuetify-components — Vuetify global registration and component API.

Use **PascalCase** for component tags in templates (`<UserCard>`).

## Dynamic components — `<component :is>`

Render different components by binding `:is` to a component reference (not a string when locally registered).

```vue
<script setup>
import TabProfile from './TabProfile.vue';
import TabSecurity from './TabSecurity.vue';
import { ref, computed } from 'vue';

const tab = ref('profile');
const tabs = { profile: TabProfile, security: TabSecurity };
const current = computed(() => tabs[tab.value]);
</script>

<template>
  <component :is="current" />
</template>
```

`:is` accepts a component object/definition or, for native elements, an HTML tag string (`:is="'h2'"`). Bind component references for locally-registered components — a bare string only resolves for globally-registered names.

To preserve state across switches, wrap in `<KeepAlive>`.

➜ See skill: vue3-builtin-components — `<KeepAlive>` caching and `<Transition>` for animated switches.

## Async components — `defineAsyncComponent`

Lazy-load a component so its code splits into a separate chunk, fetched only when first rendered. Good for heavy, rarely-shown UI (admin panels, editors, large dialogs).

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'));
</script>

<template>
  <AdminPanel v-if="isAdmin" />
</template>
```

### Loading & error states

The options object adds UX around the load.

```js
import { defineAsyncComponent } from 'vue';
import LoadingState from './LoadingState.vue';
import ErrorState from './ErrorState.vue';

const ReportChart = defineAsyncComponent({
  loader: () => import('./ReportChart.vue'),
  loadingComponent: LoadingState,
  errorComponent: ErrorState,
  delay: 200,
  timeout: 8000,
});
```

- `delay` — wait before showing the loading component (avoids flash on fast loads).
- `timeout` — show the error component if the load exceeds this.

### Suspense

Async components integrate with `<Suspense>` for a shared fallback while async setup resolves.

➜ See skill: vue3-builtin-components — `<Suspense>` usage and its SSR caveats.

### SSR & hydration

During SSR, async components are awaited and rendered to HTML on the server, then hydrated on the client. Vue 3.5 adds **lazy hydration** strategies to defer client-side hydration of an async component:

```js
import { defineAsyncComponent, hydrateOnVisible } from 'vue';

const HeavyWidget = defineAsyncComponent({
  loader: () => import('./HeavyWidget.vue'),
  hydrate: hydrateOnVisible({ rootMargin: '100px' }),
});
```

Available strategies: `hydrateOnVisible`, `hydrateOnIdle`, `hydrateOnInteraction`, `hydrateOnMediaQuery`. Use these to keep below-the-fold or interaction-gated components from hydrating eagerly. Lazy hydration is a relatively new API — verify behavior against the installed Vue version before relying on it broadly.

## Pitfalls

| Pitfall                                     | Fix                                       |
| ------------------------------------------- | ----------------------------------------- |
| `:is` with a string for a local component   | Bind the imported component reference     |
| Importing Vuetify components                | They are global — use `<v-btn>` directly  |
| `defineAsyncComponent` for tiny components  | Only split heavy / rarely-used components |
| State lost when switching `<component :is>` | Wrap in `<KeepAlive>`                     |
| No error fallback on async load             | Provide `errorComponent` + `timeout`      |
| kebab-case component tags                   | Use PascalCase (`<UserCard>`)             |
