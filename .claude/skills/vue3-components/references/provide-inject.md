# Provide / Inject

Provide/inject passes data from an ancestor to any descendant without threading props through every intermediate component (avoids "prop drilling"). Use it for cross-cutting context shared down a subtree, not as a general state replacement.

## When to use vs alternatives

| Situation                                | Use                   |
| ---------------------------------------- | --------------------- |
| Direct parent → child                    | Props                 |
| Ancestor → deep descendant, same subtree | provide / inject      |
| App-wide shared state (auth, user, cart) | Pinia store           |
| Reusable stateless logic                 | Composable (`useXxx`) |

➜ See skill: vue-ssr-architecture — Pinia is the project's app-level state layer; reach for provide/inject only for subtree-local context.

## Basic provide / inject

Provider (ancestor):

```js
import { provide } from 'vue';

provide('panelDensity', 'compact');
```

Injector (descendant):

```js
import { inject } from 'vue';

const density = inject('panelDensity');
```

## Default value

Always supply a default (or guard the result) so a component works when used outside the provider.

```js
const density = inject('panelDensity', 'comfortable');
```

For an expensive default, pass a factory and `true` as the third argument:

```js
const service = inject('service', () => createService(), true);
```

## Reactive injection

Provide a `ref` (or `computed`) so descendants update when the source changes. Plain values are not reactive.

```js
import { provide, ref, readonly } from 'vue';

const theme = ref('light');

provide('theme', readonly(theme));
```

Wrap with `readonly()` so descendants cannot mutate provider state directly. To allow controlled changes, provide an updater alongside the value:

```js
import { provide, ref, readonly } from 'vue';

const filters = ref({ status: 'all' });

function setStatus(status) {
  filters.value = { ...filters.value, status };
}

provide('filters', {
  filters: readonly(filters),
  setStatus,
});
```

Injector:

```js
const { filters, setStatus } = inject('filters');
```

This keeps all mutations inside the provider — descendants request changes, they don't perform them.

## App-level provide

For values needed app-wide (e.g. from a plugin) without a wrapping component:

```js
app.provide('appVersion', '4.0.0');
```

In this project, prefer Pinia for shared app state; reserve app-level provide for plugin-style injection.

## Symbol injection keys

In a larger subtree, export `Symbol` keys from a dedicated module to avoid string-key collisions and to centralize the contract.

```js
export const FilterContextKey = Symbol('filterContext');
```

```js
import { provide } from 'vue';
import { FilterContextKey } from './keys.js';

provide(FilterContextKey, { filters, setStatus });
```

```js
import { inject } from 'vue';
import { FilterContextKey } from './keys.js';

const ctx = inject(FilterContextKey);
```

## SSR safety

`provide`/`inject` run during `renderToString` on the server — they are SSR-safe. Do not seed provided state from browser APIs (`window`, `localStorage`) at setup top-level; set those inside `onMounted` and let the reactive value propagate.

➜ See skill: vue3-composition — SSR-safe `ref()` and `onMounted` patterns.

## Pitfalls

| Pitfall                                       | Fix                                         |
| --------------------------------------------- | ------------------------------------------- |
| Providing a plain value, expecting reactivity | Provide a `ref`/`computed`                  |
| Descendant mutates provider state             | `readonly()` + provide an updater function  |
| No default → crash when used standalone       | `inject(key, fallback)` or guard the result |
| String key collisions in a big subtree        | Use exported `Symbol` keys                  |
| Using inject for app-wide state               | Use a Pinia store instead                   |
