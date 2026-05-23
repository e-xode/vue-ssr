# Rendering & SSR Performance

How to skip unnecessary re-renders, defer heavy components, render long lists cheaply, and keep SSR fast and hydration-safe.

## v-once — render once, never again

Skips all future updates for a static sub-tree. The content still renders (and serializes under SSR) once; after that Vue never re-checks it.

```vue
<template>
  <footer v-once>{{ t('app.copyright', { year }) }}</footer>
</template>
```

Use for chrome that holds reactive data read once: a rendered-once header, a static legal block, a one-time-formatted label. Do not use it on anything that must update.

## v-memo — conditional re-render of a sub-tree

`v-memo="[depA, depB]"` memoizes the sub-tree; it re-renders only when one of the listed deps changes between renders. Most valuable on big `v-for` rows.

```vue
<template>
  <article v-for="post in posts" :key="post.id" v-memo="[post.id, post.selectedId === post.id]">
    <h3>{{ post.title }}</h3>
  </article>
</template>
```

Rules:

- The dep array must list **every** reactive value the sub-tree reads, or you get a stale render.
- Empty `v-memo="[]"` behaves like `v-once`.
- `v-memo` does not replace `:key` — keep a stable key on `v-for`.
- It is a sharp tool; add it only to a measured hot list, not everywhere.

## Stable keys

Always key `v-for` with a stable id, never the array index for lists that can reorder, insert, or delete. Index keys cause Vue to reuse the wrong DOM/component and defeat memoization.

```vue
<template>
  <UserRow v-for="user in users" :key="user._id" :user="user" />
</template>
```

➜ See skill: vue3-templates — full `v-for` key rules.

## Props stability — avoid waking every child

Passing a shared value to every list item makes all items re-render when it changes. Pass a per-item derived value instead, so only the affected items update.

```vue
<template>
  <ListItem v-for="item in list" :key="item.id" :id="item.id" :active="item.id === activeId" />
</template>
```

Here only the two items whose `active` flips will update when `activeId` changes — not the whole list. ➜ See skill: vue3-components — prop design.

## Avoid unnecessary component abstraction in hot lists

A component instance costs more than a DOM node. In a list of hundreds of rows, deep wrapper/renderless layers multiply that cost. Flatten the row markup or push repetition into a single component rather than nesting several thin wrappers per row.

## Async components & code splitting

Defer code for heavy or rarely-visited UI so it is not in the first SSR payload or the initial client bundle.

Route-level (preferred — splits per view automatically):

```js
const routes = [{ path: '/dashboard', component: () => import('../views/Dashboard.vue') }];
```

Component-level for a heavy widget inside a view:

```js
import { defineAsyncComponent } from 'vue';

const HeavyChart = defineAsyncComponent(() => import('../components/HeavyChart.vue'));
```

With loading/error UX and a delay to avoid flicker:

```js
const HeavyChart = defineAsyncComponent({
  loader: () => import('../components/HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: LoadError,
  delay: 200,
  timeout: 10000,
});
```

Wrap a group of async children in `Suspense`, or cache toggled-away async views with `KeepAlive` (➜ See skill: vue3-builtin-components — `Suspense`/`KeepAlive`). Bundle/chunking config itself is deployment's concern (➜ See skill: vue-ssr-deployment).

## Large lists — paginate or virtualize

Rendering thousands of rows into the DOM is the most common perf cliff. In order of preference for this project:

1. **Server-side `v-data-table` pagination** — the default. Fetch one page at a time; the DOM only ever holds page-sized rows. ➜ See skill: vuetify-components — `v-data-table` server-side pagination.
2. **Vuetify virtual scroller** (`v-virtual-scroll`) — for a genuinely long client-held list, render only the rows in/near the viewport.
3. **Manual virtual scrolling** — only if neither fits; rarely needed here.

Do not hand-render a `v-for` over thousands of items.

## SSR performance

`setup()` runs on the server for every request, so its cost is per-request latency.

- **Keep `setup` light** — no blocking CPU work, no synchronous heavy parsing. Push expensive client-only work into `onMounted`.
- **No browser APIs at top-level setup** — `window`/`document`/`localStorage` do not exist on the server. Read them in `onMounted` or guard with `typeof window !== 'undefined'`. ➜ See skill: vue3-composition — SSR safety rules.
- **Fetch on the server, hydrate the result** — fetch data during SSR and serialize it, rather than refetching on the client after hydration, so the first paint already has content.
- **Mark heavy non-reactive instances `markRaw`** so per-request reactivity setup stays cheap (➜ See references/reactivity-perf.md).

## Avoiding hydration mismatches

Hydration mismatch warnings mean the server-rendered HTML differs from the client's first render. The fix is a **deterministic render**: given the same data, server and client must produce identical markup.

Causes and fixes:

| Cause                                                       | Fix                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Date.now()` / `new Date()` in render                       | Compute on the server, pass the value down; or render in `onMounted`   |
| `Math.random()` / non-seeded ids in render                  | Generate once on the server and serialize; never random per side       |
| Reading `window`/`localStorage` during render               | Move to `onMounted`; render a stable placeholder for the first paint   |
| Locale/timezone-dependent formatting differing across sides | Format with a fixed locale/timezone, or defer to client in `onMounted` |
| Invalid HTML nesting (e.g. block inside `<p>`)              | Fix the markup; the browser reparses and diverges from SSR output      |

Pattern for genuinely client-only content:

```vue
<script setup>
import { ref, onMounted } from 'vue';

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <ClientOnlyWidget v-if="mounted" />
</template>
```

The server renders nothing for the widget; the client adds it after mount, so the first client render matches the server.

➜ See SKILL.md — symptom → optimization and pitfalls tables.
