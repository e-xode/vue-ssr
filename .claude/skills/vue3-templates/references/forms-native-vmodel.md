# Native-element v-model

`v-model` two-way binds a native form element to a `ref`. This file covers native HTML elements only.

➜ See skill: vuetify-components — for `v-text-field`, `v-select`, `v-checkbox`, and validation rules. In practice most forms in this project use Vuetify inputs; reach for native `v-model` only for plain HTML elements.
➜ See skill: vue3-components — for component `v-model` via `defineModel`.

## What v-model expands to

For native inputs `v-model` is sugar over a binding plus an event:

| Element              | Bound prop | Listened event |
| -------------------- | ---------- | -------------- |
| text input, textarea | `value`    | `input`        |
| checkbox, radio      | `checked`  | `change`       |
| select               | `value`    | `change`       |

```vue
<input v-model="text" />
<input :value="text" @input="(e) => (text = e.target.value)" />
```

`v-model` ignores the element's initial `value` / `checked` / `selected` attribute — the `ref` is the single source of truth.

## Text input and textarea

```vue
<template>
  <input v-model="message" type="text" />
  <textarea v-model="bio"></textarea>
</template>

<script setup>
import { ref } from 'vue';
const message = ref('');
const bio = ref('');
</script>
```

## Checkbox

Single checkbox bound to a boolean:

```vue
<input v-model="accepted" type="checkbox" />
```

Multiple checkboxes sharing one array — each contributes its `value` when checked:

```vue
<template>
  <input v-model="roles" type="checkbox" value="admin" />
  <input v-model="roles" type="checkbox" value="editor" />
</template>

<script setup>
import { ref } from 'vue';
const roles = ref([]);
</script>
```

Custom checked/unchecked values:

```vue
<input v-model="toggle" type="checkbox" true-value="yes" false-value="no" />
```

## Radio

```vue
<template>
  <input v-model="picked" type="radio" value="one" />
  <input v-model="picked" type="radio" value="two" />
</template>

<script setup>
import { ref } from 'vue';
const picked = ref('one');
</script>
```

Bind non-string values with `:value`:

```vue
<input v-model="pick" type="radio" :value="firstOption" />
```

## Select

Single select — include a disabled empty option so the first real item is selectable:

```vue
<template>
  <select v-model="selected">
    <option disabled value="">{{ t('form.choose') }}</option>
    <option value="a">A</option>
    <option value="b">B</option>
  </select>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const selected = ref('');
</script>
```

Multiple select binds to an array:

```vue
<select v-model="picks" multiple>
  <option value="a">A</option>
  <option value="b">B</option>
</select>
```

Object option values via `:value`:

```vue
<option :value="{ id: 1 }">{{ t('form.first') }}</option>
```

## Modifiers

| Modifier  | Effect                              |
| --------- | ----------------------------------- |
| `.lazy`   | Sync on `change` instead of `input` |
| `.number` | Cast the value to a number          |
| `.trim`   | Trim leading/trailing whitespace    |

```vue
<input v-model.lazy="search" />
<input v-model.number="age" type="number" />
<input v-model.trim="email" type="email" />
```

`.number` is implied for `type="number"` but leaves an empty field as a string — validate before relying on numeric type.

## SSR and IME notes

- The bound `ref` must hold the same value on server and client to avoid hydration mismatches. ➜ See skill: vue3-composition — for SSR-safe initial state.
- For IME composition (Chinese/Japanese/Korean), `v-model` does not update mid-composition. If that matters, bind `:value` + `@input` manually instead.
