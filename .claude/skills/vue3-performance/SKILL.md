---
name: vue3-performance
description: "Vue 3 performance optimization for the Vue SSR Starter Kit: reactivity perf (shallowRef/shallowReactive, markRaw, computed caching, avoiding over-reactivity), rendering perf (v-memo, v-once, stable keys), component perf (async/lazy components + code splitting), large lists (virtual scrolling via Vuetify, pagination), and SSR perf (light setup, avoiding hydration mismatches). JavaScript only, <script setup>, SSR-safe. Trigger on: optimizing render/update performance, slow large lists or tables, shallowRef/markRaw decisions, v-memo/v-once, lazy-loading components, hydration-mismatch or SSR performance issues. Don't use for: build/bundle/production deployment config (→ vue-ssr-deployment), reactivity basics (→ vue3-composition), Vuetify component API (→ vuetify-components), app architecture (→ vue-ssr-architecture)."
---

# Vue 3 Performance

> Owns optimization decisions for this project: when to make reactivity shallow, when to skip re-renders, when to lazy-load, and how to keep SSR fast and hydration-safe. Reactivity primitives themselves live in `vue3-composition` — this skill is about making them cheap.

## Symptom → optimization

| Symptom                                                       | Optimization                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Large array/object only ever replaced wholesale               | `shallowRef()` + reassign (➜ references/reactivity-perf.md)                                       |
| Heavy third-party instance (chart, map, editor) made reactive | `markRaw()` before storing                                                                        |
| Same derived value recomputed in many places                  | `computed()` (cached) instead of a method                                                         |
| Watcher fires too often / deep-watches a big object           | Watch a narrow getter, drop `{ deep: true }`                                                      |
| Static sub-tree re-renders every update                       | `v-once`                                                                                          |
| Big `v-for` row re-renders when unrelated state changes       | `v-memo` with the row's real deps                                                                 |
| All list rows update when one shared prop changes             | Pass per-item booleans, not the shared id                                                         |
| Thousands of rows in the DOM                                  | Vuetify virtual scroller or server-side `v-data-table` pagination                                 |
| Heavy view loaded on first paint but rarely visited           | Route-level code splitting / `defineAsyncComponent`                                               |
| SSR slow / hydration mismatch warning                         | Light `setup`, deterministic render, browser APIs in `onMounted` (➜ references/rendering-perf.md) |

## Project conventions

1. **`ref()` stays the default** — reach for `shallowRef()`/`shallowReactive()`/`markRaw()` only with a measured reason (large data, heavy non-reactive object). Do not pre-optimize.
2. **Treat shallow data as immutable** — replace the whole `.value`, never deep-mutate. If you must mutate, call `triggerRef()`.
3. **`computed` over methods for derived state** — computed is cached by dependencies; a method re-runs on every render.
4. **Stable `key`s in `v-for`** — always a stable id (never the array index for mutable lists). ➜ See skill: vue3-templates — `v-for` key rules.
5. **Big lists are paginated by default** — the project uses server-side `v-data-table` pagination. Reach for virtual scrolling only for truly long client-side lists.
6. **Lazy-load heavy/rare views** — route-level dynamic `import()` keeps the first SSR payload small.
7. **SSR-deterministic render** — no `Date.now()`, `Math.random()`, or `window`/`document` in render or top-level `setup`. Move them to `onMounted`.

## Reactivity perf (quick examples)

```js
import { shallowRef, triggerRef, markRaw } from 'vue';

const rows = shallowRef([]);
rows.value = await fetchRows();

const editor = markRaw(createHeavyEditor());
```

`markRaw` keeps a heavy third-party instance out of the reactivity system — Vue never proxies it, so its internal state changes never schedule re-renders. ➜ See references/reactivity-perf.md for `shallowReactive`, `triggerRef`, and computed/watcher cost.

## Rendering perf (quick examples)

```vue
<template>
  <header v-once>{{ t('app.title') }}</header>

  <article v-for="post in posts" :key="post.id" v-memo="[post.id, post.updatedAt]">
    {{ post.title }}
  </article>
</template>
```

`v-once` renders the sub-tree once and never again. `v-memo` re-renders a row only when one of the listed deps changes. ➜ See references/rendering-perf.md for async components, list virtualization, and SSR/hydration.

## Common pitfalls

| Pitfall                                                    | Fix                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Deep-mutating a `shallowRef` value and expecting an update | Reassign `.value`, or call `triggerRef()` after the mutation                                   |
| `markRaw` on an object with reactive nested data           | `markRaw` is shallow — nested objects can still be proxied; mark the whole tree or restructure |
| Using a method where a `computed` belongs                  | Methods are not cached; convert to `computed` for derived state                                |
| `v-memo` dep list omits a value the sub-tree reads         | Stale render — list every reactive value the sub-tree depends on                               |
| `v-memo` on the same element as `v-for` but missing `:key` | Keep a stable `:key`; `v-memo` does not replace it                                             |
| Index as `:key` in a reorderable list                      | DOM reuse bugs + lost optimization; use a stable id                                            |
| `Date.now()`/`Math.random()` in render under SSR           | Hydration mismatch; compute in `onMounted` or pass a server-stable value                       |
| `{ deep: true }` watcher on a large object                 | Tracks every nested key; watch a narrow getter instead                                         |
| Optimizing before measuring                                | Profile first (Vue DevTools / Performance panel); add shallow/`v-memo` only where it pays      |

## Division of responsibilities

| Concern                                                 | Owner                         |
| ------------------------------------------------------- | ----------------------------- |
| Reactivity primitives (ref/computed/watch basics)       | vue3-composition              |
| Optimization decisions (shallowRef/markRaw/v-memo/lazy) | vue3-performance (this skill) |
| Build/bundle/production deployment config               | vue-ssr-deployment            |

➜ See skill: vue3-composition — `ref`/`computed`/`watch` semantics.
➜ See skill: vuetify-components — virtual scroller and `v-data-table` server-side pagination API.
➜ See skill: vue3-builtin-components — `Suspense`/`KeepAlive` around async components.

## References

| File                                                | Content                                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [reactivity-perf.md](references/reactivity-perf.md) | shallowRef/shallowReactive/markRaw/triggerRef, computed caching, watcher cost                               |
| [rendering-perf.md](references/rendering-perf.md)   | v-memo/v-once/keys, props stability, async components, list virtualization, SSR perf + hydration mismatches |
