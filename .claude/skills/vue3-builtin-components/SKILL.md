---
name: vue3-builtin-components
description: "Vue 3 built-in components for the Vue SSR Starter Kit: Teleport (overlays/modals, SSR notes), Suspense (async setup, SSR caveats), KeepAlive (component caching, include/exclude, with router-view), Transition and TransitionGroup (enter/leave classes, JS hooks, list move transitions, key requirement). JavaScript only, <script setup>, SSR-safe. Trigger on: Teleport, Suspense, KeepAlive, Transition or TransitionGroup usage, custom overlays/modals at Vue level, async-component loading states, animating element or list enter/leave. Don't use for: Vuetify dialogs/menus/overlays and their built-in transitions (→ vuetify-components), SCSS animations and prefers-reduced-motion (→ design-scss), reactivity (→ vue3-composition), SSR lifecycle/architecture (→ vue-ssr-architecture)."
---

# Vue 3 Built-in Components

> Owns the four Vue-level built-in components — `Teleport`, `Suspense`, `KeepAlive`, `Transition`/`TransitionGroup` — their mechanics, slots, hooks, and SSR caveats. For Vuetify overlays and their transitions, defer to `vuetify-components`; for animation CSS, defer to `design-scss`.

## Quick-reference: which component for which use case

| Component         | Use case                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `Teleport`        | Render markup elsewhere in the DOM (custom modal/overlay escaping `overflow`/`z-index`/`transform`) |
| `Suspense`        | Show a loading fallback while a nested `async setup()` or async component resolves                  |
| `KeepAlive`       | Cache a swapped-out component instance to preserve its state (tabs, `<component :is>`, kept routes) |
| `Transition`      | Animate a single element entering/leaving (`v-if`, `v-show`, dynamic component, `:key` change)      |
| `TransitionGroup` | Animate a list's insert/remove/reorder (`v-for`), with move (FLIP) transitions                      |

## Project conventions

1. **Prefer Vuetify built-ins** — `v-dialog`, `v-menu`, `v-overlay`, `v-navigation-drawer` already teleport and animate. Reach for raw `Teleport`/`Transition` only for genuinely custom UI not covered by Vuetify. ➜ See skill: vuetify-components — overlay/dialog component API.
2. **`<script setup>` only** — JavaScript, no Options API, no TypeScript.
3. **Animation CSS lives in `.scss`** — class bodies (`*-enter-from`, `*-move`, durations, easings) go in the component's external `.scss` file using design tokens; honor `prefers-reduced-motion`. ➜ See skill: design-scss — transition tokens, animation mixins, reduced-motion.
4. **SSR-aware** — `Teleport` targets must exist client-side; `Suspense` is experimental; `appear` and JS hooks run client-only after hydration. ➜ See skill: vue-ssr-architecture — SSR lifecycle and hydration.
5. **`ref()` for state** — toggles driving these components are plain `ref(false)`. ➜ See skill: vue3-composition — reactivity primitives.

## Examples

Custom Teleport overlay (when Vuetify is not a fit):

```vue
<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="open" class="overlay" @click.self="open = false">
        <div class="overlay__panel">{{ t('overlay.title') }}</div>
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

Transition between two views with `mode="out-in"`:

```vue
<template>
  <Transition name="fade" mode="out-in">
    <component :is="current" :key="current" />
  </Transition>
</template>
```

Suspense around an async child with a fallback (experimental — see reference):

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

## Common pitfalls

| Pitfall                                      | Fix                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Teleport to="#x"` target not in DOM yet     | Target must exist when Teleport mounts; teleport to `body` or use `defer` (3.5+) for later-mounted targets |
| Hydration mismatch on Teleport               | Ensure the target exists on the client in the same shape; ➜ vue-ssr-architecture                           |
| Reaching for raw Teleport for a modal        | Use `v-dialog`/`v-overlay` — Vuetify already teleports and traps focus                                     |
| `Transition` wrapping multiple root elements | `Transition` allows one element/component only; switch with `:key` or use `TransitionGroup`                |
| List items animate but don't reorder         | Add a `*-move` class; ensure leaving items get `position: absolute` so siblings can shift                  |
| `TransitionGroup` children missing `:key`    | Every child needs a stable unique `key` (not the array index for reorderable lists)                        |
| `:css="false"` JS hook never finishes        | Call the `done` callback in `@enter`/`@leave`                                                              |
| Suspense fallback flashes / no error UI      | Suspense has no error handling — pair with `onErrorCaptured` in the parent                                 |

## Division of responsibilities

| Concern                                                     | Owner                                |
| ----------------------------------------------------------- | ------------------------------------ |
| Vue-level Teleport/Suspense/KeepAlive/Transition mechanics  | vue3-builtin-components (this skill) |
| Vuetify dialogs/menus/overlays + their built-in transitions | vuetify-components                   |
| SCSS animations, transition tokens, prefers-reduced-motion  | design-scss                          |
| SSR lifecycle & hydration                                   | vue-ssr-architecture                 |

## References

| File                                                          | Content                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [teleport-suspense.md](references/teleport-suspense.md)       | Teleport (`to`/`disabled`/multiple, overlays, SSR), Suspense (async, slots, events, error handling, SSR caveats)          |
| [transition-keepalive.md](references/transition-keepalive.md) | Transition CSS classes, modes, JS hooks; TransitionGroup move transitions; KeepAlive include/exclude/max with router-view |
