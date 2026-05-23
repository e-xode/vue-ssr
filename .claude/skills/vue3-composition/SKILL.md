---
name: vue3-composition
description: "Vue 3 Composition API reference for the Vue SSR Starter Kit (e-xode/vue-ssr): ref(), computed(), watch(), onMounted(), nextTick(), <script setup>, composable authoring (useXxx pattern), template refs, defineProps/defineEmits/defineModel, SSR-safe reactivity patterns, and common pitfalls (.value, destructuring loss). Trigger on any Vue 3 reactivity question, component authoring, composable creation, lifecycle hook usage, watcher setup, ref vs reactive decision, script setup syntax, defineProps, defineEmits, or template ref pattern. Don't use for: app architecture or file structure (→ vue-ssr-architecture), auth flow (→ vue-ssr-auth), deployment (→ vue-ssr-deployment), post-task validation (→ vue-ssr-hooks), UI/UX design or styling (→ design agent)."
---

# Vue 3 Composition API

> Owns all Vue 3 Composition API knowledge: reactivity primitives, lifecycle hooks, `<script setup>` syntax, composable patterns, watchers, and SSR-safe coding conventions used in this project.

## Quick-reference: which API for which use case

| Need                                  | Use                          |
| ------------------------------------- | ---------------------------- |
| Local state (string, number, boolean) | `ref()`                      |
| Local state (array, object)           | `ref([])` / `ref({})`        |
| Derived value                         | `computed(() => ...)`        |
| Side effect on state change           | `watch(source, cb)`          |
| DOM access after render               | `onMounted()`                |
| Cleanup (listeners, timers)           | `onUnmounted()`              |
| DOM update after state change         | `nextTick()`                 |
| Navigation                            | `useRouter()` / `useRoute()` |
| Translations                          | `useI18n()`                  |
| Locale-aware links                    | `useLocalePath()`            |
| reCAPTCHA token                       | `useCaptcha()`               |

## Project conventions

1. **Always `<script setup>`** — no Options API, no bare `<script>` blocks
2. **`ref()` for everything** — never `reactive()`. Consistency, explicit `.value`, easier to refactor
3. **SSR safety** — no `window`, `document`, `localStorage` at top-level setup scope. Wrap in `onMounted()` or guard with `typeof window !== 'undefined'`
4. **Composable prefix** — always `useXxx`. Return reactive state + methods as plain object
5. **No `watchEffect()`** — use explicit `watch()` with named sources for clarity
6. **No `defineExpose`** — not used in this project
7. **Template refs** — `const el = ref(null)` + `ref="el"` in template

## SSR safety rules

In SSR, `setup()` runs on both server and client. Browser APIs only exist on client.

```js
import { ref, onMounted } from 'vue';

const width = ref(0);

onMounted(() => {
  width.value = window.innerWidth;
});
```

For composables that need browser APIs at module level, guard:

```js
export function useCaptcha() {
  async function executeRecaptcha(action) {
    if (typeof window === 'undefined') return null;
    // ...browser-only logic
  }
  return { executeRecaptcha };
}
```

## Composable authoring pattern

```js
import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useWindowSize() {
  const width = ref(0);
  const height = ref(0);
  const isMobile = computed(() => width.value < 768);

  function update() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  onMounted(() => {
    update();
    window.addEventListener('resize', update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return { width, height, isMobile };
}
```

## Template ref pattern

```vue
<template>
  <input ref="inputEl" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const inputEl = ref(null);

onMounted(() => {
  inputEl.value.focus();
});
</script>
```

## Common pitfalls

| Pitfall                            | Fix                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Forgetting `.value` in JS          | Always access `ref.value` in `<script>`, auto-unwrapped in `<template>`                        |
| Destructuring ref loses reactivity | `const { x } = myRef.value` is NOT reactive. Keep the ref intact or use `toRefs()`             |
| Replacing ref contents vs mutating | `items.value = [...]` triggers reactivity. `items.value.push(x)` also works with ref           |
| Accessing DOM before mount         | Use `onMounted()` — DOM is not ready during setup                                              |
| Using browser APIs in setup        | Wrap in `onMounted()` or guard with `typeof window !== 'undefined'`                            |
| Watcher not firing                 | Ensure you watch the ref itself, not `.value`: `watch(count, cb)` not `watch(count.value, cb)` |

## References

| File                                                    | Content                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| [reactivity-system.md](references/reactivity-system.md) | ref vs reactive, shallowRef, toRefs, computed, reactivity gotchas |
| [lifecycle-hooks.md](references/lifecycle-hooks.md)     | Full lifecycle order, SSR execution model, cleanup patterns       |
| [script-setup.md](references/script-setup.md)           | defineProps, defineEmits, defineModel, useSlots, useAttrs         |
| [watchers.md](references/watchers.md)                   | watch(), watchEffect(), cleanup, flush options                    |
| [composables.md](references/composables.md)             | Authoring pattern, project examples, SSR-safe conventions         |

## Division of responsibilities

This skill owns reactivity primitives, lifecycle hooks, `<script setup>` syntax, watchers, and composables. Sibling `vue3-*` skills own adjacent Vue 3 topics:

| Concern                                                                                           | Owner                         |
| ------------------------------------------------------------------------------------------------- | ----------------------------- |
| `ref`/`computed`/`watch`/lifecycle, composables, `defineProps`/`defineEmits`/`defineModel` syntax | vue3-composition (this skill) |
| Prop/slot/inject design & component communication                                                 | vue3-components               |
| Template directives, list/conditional rendering, native `v-model`                                 | vue3-templates                |
| Teleport, Suspense, KeepAlive, Transition/TransitionGroup                                         | vue3-builtin-components       |
| Custom directives & plugins                                                                       | vue3-reusability              |
| Performance optimization (shallowRef, markRaw, v-memo)                                            | vue3-performance              |
