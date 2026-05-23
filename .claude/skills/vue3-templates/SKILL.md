---
name: vue3-templates
description: "Vue 3 template syntax for the Vue SSR Starter Kit: text interpolation, directives (v-bind/:, v-on/@, v-if/v-else/v-show, v-for with mandatory key), class and style bindings (array/object syntax), event handling (inline vs method handlers, .stop/.prevent/.self and key modifiers), native-element v-model (.lazy/.number/.trim), and rendering best practices (v-if vs v-show, never v-if together with v-for). JavaScript only, <script setup>. Trigger on: writing template markup, directives, list/conditional rendering, event handling and modifiers, class/style bindings, v-model on native HTML inputs. Don't use for: component props/slots/emits/component v-model (→ vue3-components), Vuetify form components and validation (→ vuetify-components), choosing color/spacing tokens (→ design-scss), reactivity primitives (→ vue3-composition)."
---

# Vue 3 Template Syntax

> Owns Vue 3 template markup for this project: interpolation, directives, conditional and list rendering, class/style bindings, event handling, and native-element `v-model`. Refs auto-unwrap in templates — no `.value`. ➜ See skill: vue3-composition — for the reactivity behind the values you bind.

## Quick-reference: directives

| Directive                       | Shorthand | Use                                               |
| ------------------------------- | --------- | ------------------------------------------------- |
| `v-bind:attr`                   | `:attr`   | Bind an attribute/prop to an expression           |
| `v-on:event`                    | `@event`  | Listen to a DOM event                             |
| `v-if` / `v-else-if` / `v-else` | —         | Conditionally render (adds/removes from DOM)      |
| `v-show`                        | —         | Toggle visibility via CSS `display`               |
| `v-for`                         | —         | Render a list — always with `:key`                |
| `v-model`                       | —         | Two-way bind a native form input                  |
| `v-html`                        | —         | Render raw HTML (XSS risk — trusted content only) |

## Quick-reference: modifiers

| Group     | Modifiers                                                                |
| --------- | ------------------------------------------------------------------------ |
| Event     | `.stop` `.prevent` `.self` `.capture` `.once` `.passive` `.exact`        |
| Key       | `.enter` `.esc` `.tab` `.delete` `.space` `.up` `.down` `.left` `.right` |
| System    | `.ctrl` `.alt` `.shift` `.meta`                                          |
| Mouse     | `.left` `.middle` `.right`                                               |
| `v-model` | `.lazy` `.number` `.trim`                                                |

## Project conventions

1. **Shorthands always** — `:attr` and `@event`, never the long `v-bind:` / `v-on:` form
2. **`:key` is mandatory** on every `v-for` — use a stable id, never the index when items reorder
3. **Never `v-if` and `v-for` on the same element** — filter with a `computed`, or wrap in `<template>`
4. **`v-show` for frequent toggles**, `v-if` for conditions that rarely flip or carry cost
5. **No logic in templates** — single expressions only; move anything non-trivial to `computed`
6. **Native `v-model` here only** — Vuetify inputs (`v-text-field`, `v-select`…) belong to vuetify-components
7. **All visible text via `t('key')`** — never hardcode strings in markup
8. **`v-html` is forbidden** unless the source is provably sanitized — prefer interpolation

## Concise examples

Interpolation, bindings, and a list:

```vue
<template>
  <p>{{ t('dashboard.greeting', { name: user.name }) }}</p>

  <button :disabled="isLoading" :class="{ 'is-active': isOpen }" @click="toggle">
    {{ t('common.toggle') }}
  </button>

  <ul>
    <li v-for="item in visibleItems" :key="item.id">{{ item.label }}</li>
  </ul>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isLoading = ref(false);
const isOpen = ref(false);
const user = ref({ name: 'Alice' });
const items = ref([]);

const visibleItems = computed(() => items.value.filter((i) => i.active));

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>
```

Conditional rendering and a native `v-model` form:

```vue
<template>
  <p v-if="status === 'ok'">{{ t('common.ok') }}</p>
  <p v-else-if="status === 'pending'">{{ t('common.pending') }}</p>
  <p v-else>{{ t('common.failed') }}</p>

  <form @submit.prevent="onSubmit">
    <input v-model.trim="email" type="email" />
    <input v-model.number="age" type="number" />
    <input v-model="accepted" type="checkbox" />
    <button type="submit">{{ t('common.submit') }}</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const status = ref('pending');
const email = ref('');
const age = ref(0);
const accepted = ref(false);

function onSubmit() {
  console.log(email.value, age.value, accepted.value);
}
</script>
```

## SSR note

Templates render to a string on the server, then hydrate on the client. Binding values must be deterministic and identical on both sides — no `Date.now()`, `Math.random()`, or browser-only reads inside template expressions, or hydration mismatches occur. ➜ See skill: vue3-composition — for SSR-safe state and where to read `window`.

## Common pitfalls

| Pitfall                                   | Fix                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `v-if` and `v-for` on one element         | `v-for` variable is out of scope; filter via `computed` or wrap with `<template v-for>` |
| Missing `:key` on `v-for`                 | Always provide a stable unique key; in-place patching corrupts input/component state    |
| `:key="index"` on a reorderable list      | Use `item.id`; index keys break state when order changes                                |
| Statements/multiline in `{{ }}`           | Only one expression allowed; move logic to `computed` or a method                       |
| Modifier order ignored                    | Order matters: `@click.stop.prevent` differs from `@click.prevent.self`                 |
| `v-show` on `<template>` or with `v-else` | Unsupported — use `v-if` for those                                                      |
| Forgetting `.prevent` on form submit      | `@submit.prevent` to stop the page reload                                               |
| `v-model.number` returns NaN on empty     | Empty input yields the original string; validate before use                             |
| Hardcoded text in template                | Wrap in `t('key')` ➜ See skill: translate                                               |

## Division of responsibilities

| Concern                                          | Owner                       |
| ------------------------------------------------ | --------------------------- |
| Native HTML `v-model` + modifiers, directives    | vue3-templates (this skill) |
| Vuetify form components + validation rules       | vuetify-components          |
| Component `v-model` (`defineModel`), props/slots | vue3-components             |
| Color/spacing/token choices for class/style      | design-scss                 |

## References

| File                                                        | Content                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| [directives.md](references/directives.md)                   | v-bind/v-on/v-if/v-show/v-for, dynamic args, keys, v-for precedence |
| [bindings-events.md](references/bindings-events.md)         | class/style array+object syntax, event & key modifiers              |
| [forms-native-vmodel.md](references/forms-native-vmodel.md) | native v-model on every input type, .lazy/.number/.trim             |
