# Reactivity Performance

How to make reactive state cheap. Default stays `ref()` (➜ See skill: vue3-composition — primitives). Reach here only when a structure is large or a value should never be tracked.

## Why deep reactivity has a cost

`ref(object)` and `reactive(object)` wrap the value in deep proxies: every nested property access is intercepted for dependency tracking, and nested objects are proxied lazily on access. For a handful of fields this is free. For a list of thousands of rows, or an object with deep nesting touched many times per render, the proxy overhead and the dependency graph become measurable. The fix is to opt out of deep tracking where you do not need it.

## shallowRef() — large structures replaced wholesale

Only `.value` reassignment is tracked. Deep mutations are invisible.

```js
import { shallowRef } from 'vue';

const rows = shallowRef([]);

rows.value = await fetchRows();
```

```js
const rows = shallowRef([]);

rows.value.push(newRow);

rows.value = [...rows.value, newRow];
```

The first push does **not** trigger an update; the reassignment does. Use `shallowRef` for fetched lists/tables, parsed JSON blobs, and any data you treat as immutable snapshots.

## triggerRef() — force an update after a deep mutation

When reassigning is wasteful (very large value) but you mutated in place, manually trigger:

```js
import { shallowRef, triggerRef } from 'vue';

const grid = shallowRef(buildGrid());

grid.value[r][c] = value;
triggerRef(grid);
```

Reserve this for genuinely large structures; for normal data, reassigning `.value` is clearer.

## shallowReactive() — root-level-only reactive object

Root keys are reactive; nested objects are not.

```js
import { shallowReactive } from 'vue';

const state = shallowReactive({ page: 1, filters: {} });

state.page++;

state.filters.q = 'x';
```

`state.page++` updates; `state.filters.q` does not. Rarely needed in this project — `ref()` is the convention (➜ See skill: vue3-composition — why `ref` over `reactive`). Use only for a flat container holding large nested data that you replace by reference.

## markRaw() — keep heavy objects out of reactivity

Marks an object so Vue never proxies it. Use for third-party class instances and large immutable data stored in reactive state.

```js
import { ref, markRaw } from 'vue';

const chart = ref(null);

onMounted(() => {
  chart.value = markRaw(createChart(canvasEl.value));
});
```

Without `markRaw`, Vue would deep-proxy the chart instance — wrapping its internal nodes/buffers and degrading both Vue and the library. `markRaw` returns the object untouched.

**Caveat — `markRaw` is shallow.** It marks only the object itself; nested objects can still be made reactive if they are pulled into reactive state separately. Mark the object you actually store, and avoid spreading raw-marked nested data into other reactive trees (identity hazard).

## toRaw() — temporary unproxied read

`toRaw(reactiveObj)` returns the original object for a one-off read/write without tracking. Use temporarily; never persist the raw reference alongside the proxy, or you get two identities for one value.

## computed() vs methods — caching

`computed()` caches its result and recomputes only when a tracked dependency changes. A method called from the template re-runs on **every** render.

```js
import { computed } from 'vue';

const total = computed(() => items.value.reduce((s, i) => s + i.price, 0));
```

```vue
<template>
  <span>{{ total }}</span>
</template>
```

For derived state read in the template, always prefer `computed`. Reserve methods for event handlers and one-shot actions. ➜ See skill: vue3-composition — `computed` basics.

### Computed returning a fresh object every run

A computed that builds a new object/array returns a new reference each run, so downstream watchers/children always see "changed". When stability matters, return the previous value when the meaningful content is unchanged:

```js
const status = computed((oldValue) => {
  const next = { isEven: count.value % 2 === 0 };
  if (oldValue && oldValue.isEven === next.isEven) return oldValue;
  return next;
});
```

## Watcher cost

- **Avoid `{ deep: true }` on large objects** — it traverses and tracks every nested key. Watch a narrow getter for the field you care about: `watch(() => state.value.id, cb)`.
- **Watch the ref, not `.value`** (➜ See skill: vue3-composition — watcher pitfalls).
- A watcher over a `shallowRef` fires on reassignment only; pair with `triggerRef` if you mutate in place.
- Prefer one focused watcher per concern over a single deep watcher doing everything.

## Decision summary

| Situation                                          | Reach for                         |
| -------------------------------------------------- | --------------------------------- |
| Big list/object, replaced wholesale                | `shallowRef` + reassign           |
| Same, but mutated in place                         | `shallowRef` + `triggerRef`       |
| Flat container with large nested data by reference | `shallowReactive`                 |
| Heavy third-party instance in reactive state       | `markRaw`                         |
| Derived value read in template                     | `computed`                        |
| Side effect on a single deep field                 | `watch` narrow getter (no `deep`) |
| Everything else                                    | plain `ref()`                     |

➜ See SKILL.md — symptom → optimization and pitfalls tables.
