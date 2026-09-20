# Props, Events & v-model

Contents: [Props — declaration](#props--declaration) · [One-way data flow — props are read-only](#one-way-data-flow--props-are-read-only) · [Reactive props destructure (Vue 3.5+)](#reactive-props-destructure-vue-35) · [Passing props from the parent](#passing-props-from-the-parent) · [Emits — declaration](#emits--declaration) · [Emits — validation](#emits--validation) · [defineModel — component v-model](#definemodel--component-v-model) · [Pitfalls](#pitfalls)

How a component declares its public contract: data in via props, data out via emits, two-way via `defineModel`.

➜ See skill: vue3-composition — for the macro mechanics of `defineProps`/`defineEmits`/`defineModel`; this file covers the **design** of that contract.

## Props — declaration

Always use the object syntax (validation), never the bare array form. In this project props are validated.

```js
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  tags: { type: Array, default: () => [] },
  config: { type: Object, default: () => ({}) },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'accent'].includes(v),
  },
});
```

Rules:

- Object/Array defaults MUST be a factory function (`default: () => []`).
- A `validator` runs in dev only; use it to constrain enum-like props.
- Boolean props auto-cast: `<MyCard flat />` resolves to `flat = true`.

## One-way data flow — props are read-only

Props flow parent → child and are immutable in the child. Never assign to a prop.

```js
const props = defineProps({ size: { type: String, default: 'md' } });

const normalizedSize = computed(() => props.size.trim().toLowerCase());
```

If the child needs to change the value, emit an event (or use `defineModel`) and let the parent own it. To seed local editable state from a prop:

```js
import { ref } from 'vue';

const props = defineProps({ initialName: { type: String, default: '' } });
const name = ref(props.initialName);
```

## Reactive props destructure (Vue 3.5+)

Destructuring `defineProps` keeps reactivity. To pass a destructured prop into a watcher or composable, wrap it in a getter.

```js
const { keyword = '' } = defineProps({ keyword: String });

watch(
  () => keyword,
  (value) => runSearch(value)
);
```

➜ See skill: vue3-composition — `toRef(props, 'x')` / `toRefs(props)` when a composable needs an individual prop as a ref.

## Passing props from the parent

```vue
<UserCard title="Welcome" :likes="42" :user="currentUser" />

<UserCard v-bind="cardProps" />
```

`v-bind` without an argument spreads an object as individual props.

## Emits — declaration

Declare every event a component emits. Undeclared events leak into `$attrs` as fallthrough listeners.

```js
const emit = defineEmits(['submit', 'cancel']);

function onSave() {
  emit('submit', { id: props.id });
}
```

Event names are emitted in camelCase and listened to in kebab-case: `emit('updateUser')` ⇄ `@update-user`.

## Emits — validation

Object syntax validates the payload (dev-only). Return `true`/`false`.

```js
const emit = defineEmits({
  submit: (payload) => {
    if (payload?.email && payload?.password) return true;
    console.error('Invalid submit payload');
    return false;
  },
  cancel: null,
});
```

Use `null` for events that need no validation.

## defineModel — component v-model

`defineModel()` returns a ref synced with the parent's `v-model`. It compiles to a `modelValue` prop plus an `update:modelValue` event — you never write that boilerplate.

```vue
<script setup>
const model = defineModel({ type: String, default: '' });
</script>

<template>
  <v-text-field v-model="model" />
</template>
```

Parent:

```vue
<SearchField v-model="query" />
```

### Options

```js
const model = defineModel({ type: Number, required: true });
```

Avoid `default:` when the parent always binds a value — a child-side default can desync the parent on first render.

### Multiple bindings

```vue
<script setup>
const firstName = defineModel('firstName');
const lastName = defineModel('lastName');
</script>
```

```vue
<FullName v-model:first-name="first" v-model:last-name="last" />
```

### Modifiers

Destructure to read modifiers and transform the value with `get`/`set`.

```vue
<script setup>
const [model, modifiers] = defineModel({
  set(value) {
    return modifiers.trim ? value.trim() : value;
  },
});
</script>
```

```vue
<EmailField v-model.trim="email" />
```

➜ See skill: vue3-templates — for native-element `v-model` (`<input v-model>`) and its built-in modifiers.

## Pitfalls

| Pitfall                                     | Fix                                                    |
| ------------------------------------------- | ------------------------------------------------------ |
| Object/array prop default not a factory     | `default: () => ({})`, never `default: {}`             |
| Mutating a prop in the child                | Derive via `computed`, or emit / `defineModel`         |
| Forgetting to declare an emit               | Add it to `defineEmits` or it falls through as an attr |
| `default` on `defineModel` desyncing parent | Omit the default; let the parent own the value         |
| camelCase listener in template              | Listen in kebab-case: `@update-user`                   |
