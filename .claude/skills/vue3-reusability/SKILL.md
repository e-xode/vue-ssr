---
name: vue3-reusability
description: "Vue 3 reusability via custom directives and plugins for the Vue SSR Starter Kit: custom directives (mounted/updated hooks, SSR client-side caveats, function shorthand, arguments and modifiers, directive vs component decision) and plugins (app.use, install function, app-level provide injections, global properties used sparingly). JavaScript only, SSR-safe. Trigger on: writing a custom directive (v-xxx), authoring a Vue plugin, app-level install logic, deciding directive vs component vs composable. Don't use for: composables which are the primary reuse mechanism (→ vue3-composition), component props/slots (→ vue3-components), Vuetify usage (→ vuetify-components), app architecture (→ vue-ssr-architecture)."
---

# Vue 3 Reusability — Directives & Plugins

> Covers the **secondary** reuse mechanisms: custom directives (DOM behavior) and plugins (app-wide setup). **Composables are the primary reuse mechanism in this project and are owned by `vue3-composition`** — reach for them first. Use a directive only for low-level DOM access, a plugin only for one-time app installation.

## Which reuse mechanism?

| You want to reuse                                    | Mechanism                  | Owner              |
| ---------------------------------------------------- | -------------------------- | ------------------ |
| Stateful logic (refs, computed, watchers, lifecycle) | Composable (`useXxx`)      | `vue3-composition` |
| Low-level DOM behavior on plain elements             | Custom directive (`v-xxx`) | this skill         |
| One-time app-wide setup (register globals, provide)  | Plugin (`app.use`)         | this skill         |
| Markup + props + slots                               | Component                  | `vue3-components`  |

**Default to a composable.** Only drop to a directive when you genuinely need raw DOM access that a composable + template ref cannot express cleanly, and only write a plugin when something must run once at app creation.

## Project conventions

1. **JavaScript only** — no TypeScript anywhere
2. **`<script setup>` only** — local directives use the `vXxx` naming convention (auto-registered)
3. **SSR-safe** — directive DOM hooks (`mounted`, `updated`, …) run **client-side only**; never assume they fire during `renderToString`. Plugin `install()` runs on **both** server and client, so guard browser APIs with `typeof window !== 'undefined'`
4. **Plugins live in `src/plugins/`** — exported as a factory (see `src/plugins/vuetify.js`) and wired in `src/main.js` via `.use()`
5. **`app.config.globalProperties` is a last resort** — prefer `provide`/`inject` or a composable
6. **No code comments** in `.js`/`.vue` files

## Custom directive — local in `<script setup>`

```vue
<template>
  <input v-focus />
</template>

<script setup>
const vFocus = {
  mounted: (el) => el.focus(),
};
</script>
```

The binding object exposes `value`, `arg`, and `modifiers`:

```vue
<template>
  <p v-highlight:bg.bold="color">Text</p>
</template>

<script setup>
import { ref } from 'vue';

const color = ref('#fef08a');

const vHighlight = {
  mounted: (el, binding) => apply(el, binding),
  updated: (el, binding) => apply(el, binding),
};

function apply(el, binding) {
  const prop = binding.arg === 'bg' ? 'backgroundColor' : 'color';
  el.style[prop] = binding.value;
  el.style.fontWeight = binding.modifiers.bold ? '700' : '';
}
</script>
```

Function shorthand (runs on `mounted` + `updated` only):

```js
app.directive('color', (el, binding) => {
  el.style.color = binding.value;
});
```

## Plugin — install contract

```js
export default {
  install(app, options) {
    app.directive('focus', { mounted: (el) => el.focus() });
    app.provide('appConfig', options);
  },
};
```

Wire it in `src/main.js` alongside the existing plugins:

```js
app.use(router).use(vuetify).use(pinia).use(i18n).use(myPlugin, { theme: 'light' });
```

Consume a provided value with `inject`:

```js
import { inject } from 'vue';

const appConfig = inject('appConfig');
```

## Common pitfalls

| Pitfall                                       | Fix                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Reaching for a directive to share state       | Use a composable instead (→ vue3-composition)                               |
| Directive used on a component                 | Directives target plain DOM elements; warns and behaves oddly on components |
| Assuming `mounted` fires during SSR           | DOM hooks are client-only; never read the directive's effect server-side    |
| Browser API in plugin `install()`             | `install` runs on server too — guard with `typeof window !== 'undefined'`   |
| Mutating `binding` to share data across hooks | `binding` is read-only; stash state on `el.dataset` or a `WeakMap`          |
| Overusing `app.config.globalProperties`       | Prefer `provide`/`inject` or a composable; globals get confusing fast       |
| Directive on a multi-root component           | Ignored on multi-root nodes; wrap a single element instead                  |

## Division of responsibilities

| Concern                                       | Owner                         |
| --------------------------------------------- | ----------------------------- |
| Composables (primary reuse: stateful logic)   | vue3-composition              |
| Custom directives & plugins (secondary reuse) | vue3-reusability (this skill) |
| Component-based reuse (props/slots)           | vue3-components               |

➜ See skill: vue3-composition — composables are the primary reuse mechanism; use them before a directive or plugin.
➜ See skill: vuetify-components — Vuetify ships its own directives/components; do not reimplement them.
➜ See skill: vue-ssr-architecture — where plugins are wired (`main.js`, `src/plugins/`) and the SSR lifecycle.

## References

| File                                                    | Content                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [custom-directives.md](references/custom-directives.md) | Full hook list, binding object, registration, SSR caveat, directive-vs-component |
| [plugins.md](references/plugins.md)                     | install contract, app.use, app-level provide, global properties                  |
