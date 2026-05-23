---
name: vue3-components
description: "Vue 3 component design and communication for the Vue SSR Starter Kit: props (definition, validation, one-way data flow), emits/events (declaration + validation), component v-model via defineModel, slots (default, named, scoped, conditional), provide/inject (reactive injection, injection keys), fallthrough attributes (inheritAttrs), dynamic components (<component :is>), and async components (defineAsyncComponent). JavaScript only, <script setup>, SSR-safe. Trigger on: designing component props/events, parent-child communication, slot patterns, provide/inject, dynamic or async components, building reusable custom components. Don't use for: ref/computed/watch/lifecycle reactivity (→ vue3-composition), Vuetify component API/props (→ vuetify-components), template directives/v-for/native v-model (→ vue3-templates), SCSS styling (→ design-scss), app architecture/routing (→ vue-ssr-architecture)."
---

# Vue 3 Components

> Owns Vue 3 component design and communication: the public contract of a component (props, emits, `v-model`), content composition (slots), ancestor-descendant context (provide/inject), fallthrough attributes, and dynamic/async component patterns. JavaScript only, `<script setup>`, SSR-safe.

## Quick-reference: which mechanism for which need

| Need                                               | Use                                  |
| -------------------------------------------------- | ------------------------------------ |
| Data parent → child                                | Prop (`defineProps`)                 |
| Event child → parent                               | Emit (`defineEmits`)                 |
| Two-way binding on a component                     | `defineModel()`                      |
| Inject template content into a child               | Slot                                 |
| Expose child data to slotted content               | Scoped slot                          |
| Render markup only if slot filled                  | `v-if="$slots.name"`                 |
| Ancestor → deep descendant context                 | provide / inject                     |
| App-wide shared state                              | Pinia store (→ vue-ssr-architecture) |
| Forward `class`/`style`/listeners to inner element | Fallthrough attrs / `$attrs`         |
| Swap component at runtime                          | `<component :is>`                    |
| Lazy-load a heavy component                        | `defineAsyncComponent`               |

## Communication direction at a glance

| Direction             | Mechanism                               |
| --------------------- | --------------------------------------- |
| Down (parent → child) | props, provide/inject, slots            |
| Up (child → parent)   | emits, `defineModel`, scoped slot props |
| Two-way               | `defineModel`                           |

## Project conventions

1. **`<script setup>` only** — no Options API, no bare `<script>`.
2. **Object-syntax props with validation** — never the bare array form. Object/array defaults are factory functions: `default: () => []`.
3. **One-way data flow** — props are read-only. Derive with `computed`, or emit / `defineModel` to change a value the parent owns.
4. **Declare every emit** — undeclared events leak as fallthrough listeners.
5. **`defineModel()` for component v-model** — never hand-write `modelValue` + `update:modelValue`.
6. **Prefer Vuetify for UI** — Vuetify components are globally registered (no import); reach for custom components for project-specific composition. (→ vuetify-components)
7. **Local registration** for custom components — import in `<script setup>`; PascalCase tags.
8. **provide/inject for subtree context only** — app-wide state belongs in Pinia.
9. **i18n all user-visible text** — `t('key')`, never hardcoded strings. (→ translate)
10. **SSR-safe** — props/emits/slots/provide all run during `renderToString`; no `window`/`document` at setup top-level.

## Props, emits, v-model — minimal shapes

```vue
<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'accent'].includes(v),
  },
});

const emit = defineEmits(['submit']);

const model = defineModel({ type: String, default: '' });

const cssClass = computed(() => `field--${props.variant}`);
</script>

<template>
  <div :class="cssClass">
    <v-text-field v-model="model" :label="label" />
    <v-btn @click="emit('submit', model)">{{ t('common.save') }}</v-btn>
  </div>
</template>
```

➜ See skill: vue3-composition — for the macro mechanics of `defineProps`/`defineEmits`/`defineModel`; this skill owns their **design**.

## Slots — content composition

```vue
<template>
  <article class="panel">
    <header v-if="$slots.header"><slot name="header" /></header>
    <slot :rows="rows" />
  </article>
</template>

<script setup>
defineProps({ rows: { type: Array, default: () => [] } });
</script>
```

## Fallthrough attributes

Undeclared attributes (`class`, `style`, `id`, listeners) auto-apply to the single root element. To target an inner element, disable inheritance and bind `$attrs` explicitly.

```vue
<script setup>
defineOptions({ inheritAttrs: false });
</script>

<template>
  <label class="field-wrap">
    <input v-bind="$attrs" />
  </label>
</template>
```

In `<script>`, read fallthrough attrs with `useAttrs()`. Components with multiple root nodes must bind `v-bind="$attrs"` on the intended node.

## Division of responsibilities

| Concern                                                | Owner                        |
| ------------------------------------------------------ | ---------------------------- |
| `defineProps`/`defineEmits`/`defineModel` macro syntax | vue3-composition             |
| Prop/slot/inject design & communication patterns       | vue3-components (this skill) |
| Vuetify component props/API                            | vuetify-components           |
| Template directives, native-element `v-model`          | vue3-templates               |

## Common pitfalls

| Pitfall                                         | Fix                                                 |
| ----------------------------------------------- | --------------------------------------------------- |
| Object/array prop default not a factory         | `default: () => ({})`, never `default: {}`          |
| Mutating a prop in the child                    | Derive via `computed`, or emit / `defineModel`      |
| Undeclared emit                                 | Add to `defineEmits` or it falls through as an attr |
| `default` on `defineModel` desyncing the parent | Omit it; let the parent own the value               |
| Hand-writing `modelValue` + `update:modelValue` | Use `defineModel()`                                 |
| Wrapper markup renders empty when slot unused   | Guard with `v-if="$slots.name"`                     |
| Providing a plain value, expecting reactivity   | Provide a `ref`/`computed`, wrap in `readonly()`    |
| `:is` with a string for a local component       | Bind the imported component reference               |
| Importing Vuetify components                    | They are global — use `<v-card>` directly           |

## References

| File                                              | Content                                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [props-events.md](references/props-events.md)     | Props design/validation, one-way flow, emits + validation, `defineModel` (options, multiple bindings, modifiers) |
| [slots.md](references/slots.md)                   | Default/named/conditional slots, scoped slots, dynamic names, renderless pattern                                 |
| [provide-inject.md](references/provide-inject.md) | provide/inject, reactive injection, `readonly`, Symbol keys, when to use vs props/Pinia                          |
| [dynamic-async.md](references/dynamic-async.md)   | Local vs global registration, `<component :is>`, `defineAsyncComponent`, loading/error states, lazy hydration    |
