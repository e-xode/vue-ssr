# Custom Directives

A custom directive reuses **low-level DOM behavior** on plain elements. It is a plain object of optional lifecycle hooks (or a function shorthand). Reach for it only when a composable + template ref cannot express the DOM access cleanly.

➜ See skill: vue3-composition — for sharing stateful logic, use a composable, not a directive.

## Hooks

Every hook is optional and receives `(el, binding, vnode, prevVnode)`.

| Hook            | Fires                                                         |
| --------------- | ------------------------------------------------------------- |
| `created`       | before the element's attributes / event listeners are applied |
| `beforeMount`   | before the element is inserted into the DOM                   |
| `mounted`       | after the element is inserted into its parent                 |
| `beforeUpdate`  | before the containing component's vnode updates               |
| `updated`       | after the containing component and its children have updated  |
| `beforeUnmount` | before the element is removed                                 |
| `unmounted`     | after the element is removed                                  |

```js
const myDirective = {
  created(el, binding, vnode) {},
  beforeMount(el, binding, vnode) {},
  mounted(el, binding, vnode) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {},
  beforeUnmount(el, binding, vnode) {},
  unmounted(el, binding, vnode) {},
};
```

## The binding object

| Property    | Meaning                                                       |
| ----------- | ------------------------------------------------------------- |
| `value`     | the passed value — `v-pin="200"` → `200`                      |
| `oldValue`  | previous value (only in `beforeUpdate` / `updated`)           |
| `arg`       | the argument — `v-pin:top` → `"top"` (dynamic: `v-pin:[dir]`) |
| `modifiers` | object of modifiers — `v-pin.smooth` → `{ smooth: true }`     |
| `instance`  | the component instance using the directive                    |
| `dir`       | the directive definition object                               |

`binding` is **read-only**. To share state across hooks, stash it on `el.dataset` or a module-level `WeakMap` keyed by `el`.

```vue
<template>
  <p v-pin:[direction].smooth="offset">Pinned</p>
</template>

<script setup>
import { ref } from 'vue';

const direction = ref('top');
const offset = ref(200);

const vPin = {
  mounted: (el, binding) => place(el, binding),
  updated: (el, binding) => place(el, binding),
};

function place(el, binding) {
  el.style.position = 'fixed';
  el.style[binding.arg] = `${binding.value}px`;
  el.style.transition = binding.modifiers.smooth ? 'all .3s' : '';
}
</script>
```

## Function shorthand

When the same logic runs on `mounted` and `updated` and nothing else, pass a function:

```js
app.directive('color', (el, binding) => {
  el.style.color = binding.value;
});
```

## Registration

**Local in `<script setup>`** (preferred) — declare a `const` named `vXxx`; it is auto-registered as `v-xxx` in the template:

```vue
<script setup>
const vFocus = {
  mounted: (el) => el.focus(),
};
</script>

<template>
  <input v-focus />
</template>
```

**Global** — register once, usually inside a plugin (➜ see plugins.md):

```js
app.directive('focus', {
  mounted: (el) => el.focus(),
});
```

## SSR caveat

In this project `setup()` runs on **both** server and client, but a directive's **DOM hooks (`mounted`, `updated`, `unmounted`, …) run on the client only** — there is no DOM during `renderToString`. Consequences:

- Never rely on a directive's visual effect being present in the server-rendered HTML; it appears after hydration.
- Do not perform data-fetching or produce render output from a directive — it will not exist server-side and can cause hydration mismatch.
- Browser APIs (`window`, `IntersectionObserver`, …) inside hooks are safe because the hooks are client-only, but still clean up in `beforeUnmount` / `unmounted`.

```vue
<script setup>
const vReveal = {
  mounted(el) {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.classList.add('is-visible');
    });
    io.observe(el);
    el._io = io;
  },
  unmounted(el) {
    el._io?.disconnect();
  },
};
</script>

<template>
  <section v-reveal>Lazy revealed</section>
</template>
```

## Directive vs component vs composable

| Use a…           | When                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Composable       | you reuse stateful logic (refs, computed, watchers, lifecycle) — the default (→ vue3-composition)                          |
| Custom directive | you need raw DOM access on a plain element that a template ref makes awkward (focus, autoresize, observers, click-outside) |
| Component        | you reuse markup with props/slots (→ vue3-components)                                                                      |

Notes:

- Directives are designed for **plain HTML elements**. Using one on a component warns and behaves unexpectedly.
- A directive on a **multi-root** component is ignored — wrap a single element.
- Prefer declarative `v-bind` / built-in directives before writing a custom one.

➜ See skill: vuetify-components — Vuetify supplies its own directives (e.g. ripple); do not reimplement them.
