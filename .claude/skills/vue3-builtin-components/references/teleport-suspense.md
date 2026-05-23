# Teleport & Suspense

## Teleport

`<Teleport>` renders its slot content at a different place in the DOM while keeping it in the same logical component tree. Props, emits, and provide/inject all behave as if it never moved — only the rendered DOM position changes.

### When to reach for it

Use it when an element must escape an ancestor's `overflow: hidden`, `z-index` stacking context, or CSS `transform` — the classic case being a custom modal/overlay that should sit at `<body>` level.

In this project, **prefer Vuetify**: `v-dialog`, `v-menu`, `v-overlay`, and `v-tooltip` already teleport (to a Vuetify overlay container) and handle focus trapping. Reach for raw `Teleport` only for bespoke UI Vuetify does not provide. ➜ See skill: vuetify-components — overlay components.

### `to` — the target

A CSS selector string or an actual DOM element:

```vue
<Teleport to="body">
  <div class="my-overlay">...</div>
</Teleport>
```

The target **must already exist in the DOM when the Teleport mounts**. Teleporting to `body` is always safe. To target an element rendered later in the same app, use `defer` (Vue 3.5+) so resolution waits until the rest of the tree mounts:

```vue
<Teleport defer to="#late-container">...</Teleport>
```

### `disabled` — render inline instead

Toggle teleporting on/off (e.g. inline on mobile, teleported on desktop):

```vue
<Teleport :disabled="isMobile">...</Teleport>
```

### Multiple Teleports to one target

They append in mount order — useful for a shared overlay stack:

```vue
<Teleport to="#modals"><div>A</div></Teleport>
<Teleport to="#modals"><div>B</div></Teleport>
```

### SSR caveats

- Teleported content is **not** rendered into its target during `renderToString` — the server serializes it in a way the client hydrates and relocates. The target element itself must exist on the client. ➜ See skill: vue-ssr-architecture — SSR lifecycle & hydration.
- Never teleport to a selector that exists only on the server, or only after a client-only branch. A mismatch produces a hydration warning and a misplaced node.
- Drive visibility with a `ref(false)` toggle (often flipped in `onMounted`) so the initial server and client render agree. ➜ See skill: vue3-composition — SSR-safe refs.
- Animate the overlay with `Transition` inside the `Teleport`; class bodies belong in the component `.scss`. ➜ See skill: design-scss — transitions & reduced-motion.

### Worked example

```vue
<template>
  <button @click="open = true">{{ t('overlay.open') }}</button>

  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="open" class="overlay" @click.self="open = false">
        <div class="overlay__panel">
          <slot />
          <button @click="open = false">{{ t('common.close') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const open = ref(false);
</script>

<style lang="scss" scoped src="./CustomOverlay.scss"></style>
```

## Suspense

> `<Suspense>` is **experimental** — its API may change between minor Vue versions. Use it deliberately and keep usage isolated. For routine async data, prefer fetching in `onMounted`/composables with explicit loading refs.

`<Suspense>` orchestrates async dependencies in its subtree, showing a fallback until they resolve.

### Two async dependency types

1. **Async `setup()`** — a component with a top-level `await` in `<script setup>` (its setup returns a promise).
2. **Async components** — created via dynamic `import()`; suspensible unless `suspensible: false`.

### Slots

```vue
<template>
  <Suspense>
    <AsyncStats />
    <template #fallback>
      <v-progress-circular indeterminate />
    </template>
  </Suspense>
</template>
```

- `#default` — the real content (one root component); rendered once all nested async deps resolve.
- `#fallback` — shown while pending.

The pending state is only re-entered when the **root node** of `#default` is replaced — swapping deep descendants does not re-trigger the fallback unless wrapped appropriately.

### Events & timeout

```vue
<Suspense timeout="500" @pending="onPending" @resolve="onResolve" @fallback="onFallback">
```

- `timeout` delays showing the fallback by N ms (avoids a flash on fast resolves).
- `@pending` / `@resolve` / `@fallback` fire on state transitions.

### Error handling

`<Suspense>` has **no built-in error handling**. A rejected async dependency must be caught by an ancestor:

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);
onErrorCaptured((err) => {
  error.value = err;
  return false;
});
</script>
```

### Combining with router-view, Transition & KeepAlive

Order matters — `Transition` outside, then `KeepAlive`, then `Suspense`, then the component:

```vue
<router-view v-slot="{ Component }">
  <Transition mode="out-in">
    <KeepAlive>
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <v-progress-circular indeterminate />
        </template>
      </Suspense>
    </KeepAlive>
  </Transition>
</router-view>
```

For nested async trees (3.3+), mark the inner `<Suspense suspensible>` so it reports to the outer one.

### SSR caveats

- On SSR, async deps inside `<Suspense>` are awaited during `renderToString`, so the server emits the resolved content (not the fallback). The fallback is a client-side state after hydration. ➜ See skill: vue-ssr-architecture.
- Because the API is experimental and SSR semantics can shift, gate adoption behind a clear need and keep an `onErrorCaptured` boundary above it.
- Toggles and async refs must stay SSR-safe — no `window`/`document` at setup top level. ➜ See skill: vue3-composition.
