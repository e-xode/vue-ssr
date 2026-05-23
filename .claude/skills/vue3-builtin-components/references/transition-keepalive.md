# Transition, TransitionGroup & KeepAlive

> Mechanics only. All CSS class bodies (durations, easings, transforms) live in the component `.scss` using design tokens and must respect `prefers-reduced-motion`. ➜ See skill: design-scss — transitions, animations, reduced-motion.
>
> Vuetify components animate themselves (dialog/menu/overlay/expansion). Use raw `Transition` only for custom elements not driven by Vuetify. ➜ See skill: vuetify-components.

## Transition

Wraps a **single** element or component and animates its enter/leave when triggered by `v-if`, `v-show`, a dynamic `<component :is>`, or a changing `:key`.

```vue
<template>
  <Transition name="fade">
    <p v-if="show">{{ t('demo.hello') }}</p>
  </Transition>
</template>
```

### The six CSS classes

| Class            | Phase                                   |
| ---------------- | --------------------------------------- |
| `*-enter-from`   | enter — initial state (one frame)       |
| `*-enter-active` | enter — duration/easing/delay live here |
| `*-enter-to`     | enter — final state                     |
| `*-leave-from`   | leave — initial state (one frame)       |
| `*-leave-active` | leave — duration/easing/delay live here |
| `*-leave-to`     | leave — final state                     |

`*` is the `name` prop (default prefix `v`). With `name="fade"` the classes become `fade-enter-active`, etc.

### Props

- `name` — class prefix (can be dynamic).
- `appear` — also animate on initial render (client-side after hydration).
- `mode` — `out-in` (leave finishes, then enter — the common choice for swapping views) or `in-out`.
- `duration` — explicit ms (`:duration="300"` or `:duration="{ enter: 300, leave: 200 }"`) when Vue can't infer it.
- `type` — `"transition"` or `"animation"` to disambiguate when both are present.
- Custom class overrides: `enter-active-class`, `leave-active-class`, etc. (for external libraries).

### JS hooks

For imperative animations (e.g. a JS animation library), add `:css="false"` to skip CSS sniffing, and **call `done`** in `@enter`/`@leave`:

```vue
<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="show" ref="boxEl" />
  </Transition>
</template>

<script setup>
function onEnter(el, done) {
  done();
}
function onLeave(el, done) {
  done();
}
</script>
```

Available hooks: `before-enter`, `enter`, `after-enter`, `enter-cancelled`, `before-leave`, `leave`, `after-leave`, `leave-cancelled`.

### SSR note

The initial server render emits the element in its resting state — no enter classes are serialized. `appear` and all JS hooks run only on the client after hydration. ➜ See skill: vue-ssr-architecture.

## TransitionGroup

Animates **insertion, removal, and reordering** of items in a `v-for` list. Same class system as `Transition`, with these differences:

- Renders **no wrapper** unless you pass `tag` (e.g. `tag="ul"`).
- **No `mode`** — items are not mutually exclusive.
- Classes apply to each child item, not a container.
- **Every child must carry a stable, unique `:key`** — never the array index for reorderable lists. ➜ See skill: vue3-templates — `v-for` and key requirement.

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item.label }}</li>
  </TransitionGroup>
</template>
```

### Move transitions (FLIP)

Add a `*-move` class so items smoothly slide to new positions when the list reorders. Give leaving items `position: absolute` in `*-leave-active` so remaining items can shift into place:

```scss
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all $transition-base;
}
.list-leave-active {
  position: absolute;
}
```

Caveat: the FLIP technique does **not** work on elements set to `display: inline`; use `inline-block` or a flex/grid layout. ➜ See skill: design-scss — animation tokens.

### Staggering

For staggered enter/leave, pass `:css="false"`, set a `data-index` on each item, and read `el.dataset.index` inside the JS `@enter` hook to compute a per-item delay.

## KeepAlive

Caches a component instance instead of unmounting it, preserving its state when it is swapped out. Wraps a single dynamic child.

```vue
<template>
  <KeepAlive>
    <component :is="activeTab" />
  </KeepAlive>
</template>
```

### include / exclude / max

Match against the component `name` (auto-inferred from the filename in `<script setup>` since 3.2.34):

```vue
<KeepAlive include="ProfileTab,BillingTab">...</KeepAlive>
<KeepAlive :exclude="/Modal$/">...</KeepAlive>
<KeepAlive :include="['ProfileTab', 'BillingTab']">...</KeepAlive>
```

`max` caps the cache size with LRU eviction:

```vue
<KeepAlive :max="10"><component :is="active" /></KeepAlive>
```

### Lifecycle hooks

Cached components fire `onActivated`/`onDeactivated` instead of mount/unmount on each switch (these also fire for descendants in the cached tree):

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue';

onActivated(() => {});
onDeactivated(() => {});
</script>
```

`onMounted` still runs once on first insertion; per-visit work (refetch, focus, restart a timer) belongs in `onActivated`, and cleanup that should pause while cached belongs in `onDeactivated`. ➜ See skill: vue3-composition — lifecycle hooks.

### With router-view

Wrap the `<component :is>` exposed by the router-view slot. Order it inside any `Transition`:

```vue
<router-view v-slot="{ Component }">
  <Transition name="fade" mode="out-in">
    <KeepAlive :include="['ListView']">
      <component :is="Component" />
    </KeepAlive>
  </Transition>
</router-view>
```

### SSR note

`KeepAlive` is a client-side state-preservation mechanism — there is no server-side cache across requests. Each SSR request renders fresh; caching only takes effect once the app is interactive on the client. ➜ See skill: vue-ssr-architecture.
