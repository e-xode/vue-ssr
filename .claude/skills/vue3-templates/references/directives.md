# Directives

Core directives for binding, conditional rendering, and lists. Shorthands (`:`, `@`) are the project standard.

## Text interpolation

```vue
<span>{{ message }}</span>
<span>{{ ok ? t('common.yes') : t('common.no') }}</span>
```

Only a single expression — no `if`, `for`, `var`, or statements. Restricted globals (`Math`, `Date`) only. Move anything heavier to a `computed`.

## v-bind / `:`

Bind an attribute or prop to an expression.

```vue
<a :href="url">link</a>
<button :disabled="isLoading">{{ t('common.submit') }}</button>
```

Boolean attributes: present when truthy, omitted when falsy (`:disabled="false"` removes the attribute).

Same-name shorthand (3.4+) — when attribute and variable share a name:

```vue
<div :id></div>
```

Bind a whole object of attributes:

```vue
<div v-bind="attrs"></div>
```

Dynamic argument — the attribute name itself is an expression (must resolve to a string or `null`):

```vue
<a :[attrName]="url"></a>
<button @[eventName]="run"></button>
```

## v-on / `@`

```vue
<button @click="handler">click</button>
```

Full handler details (inline vs method, `$event`, modifiers) live in `bindings-events.md`.

## v-if / v-else-if / v-else

Adds and removes elements from the DOM. `v-else` / `v-else-if` must immediately follow their sibling.

```vue
<p v-if="type === 'a'">A</p>
<p v-else-if="type === 'b'">B</p>
<p v-else>other</p>
```

Group several elements without a wrapper using `<template>` (renders nothing itself):

```vue
<template v-if="ready">
  <h1>{{ t('page.title') }}</h1>
  <p>{{ t('page.body') }}</p>
</template>
```

## v-show

Toggles `display: none` — the element stays in the DOM. Does not support `<template>` or `v-else`.

```vue
<div v-show="isOpen">{{ t('common.content') }}</div>
```

|              | `v-if`                          | `v-show`                 |
| ------------ | ------------------------------- | ------------------------ |
| Toggling     | Mounts/unmounts                 | CSS only                 |
| Initial cost | Lower (lazy)                    | Higher (always rendered) |
| Toggle cost  | Higher                          | Lower                    |
| Use when     | Rarely changes / costly subtree | Toggled often            |

## v-for

Array, with index:

```vue
<li v-for="(item, index) in items" :key="item.id">
  {{ index }} — {{ item.label }}
</li>
```

Destructuring the item:

```vue
<li v-for="{ id, label } in items" :key="id">{{ label }}</li>
```

Object — `(value, key, index)`:

```vue
<li v-for="(value, key) in myObject" :key="key">{{ key }}: {{ value }}</li>
```

Range (1…n):

```vue
<span v-for="n in 5" :key="n">{{ n }}</span>
```

On `<template>` to repeat a group:

```vue
<template v-for="row in rows" :key="row.id">
  <dt>{{ row.term }}</dt>
  <dd>{{ row.def }}</dd>
</template>
```

### The `:key` is mandatory

Every `v-for` needs a stable, primitive `:key`. Without it Vue patches nodes in place, which corrupts form input values and child-component state when the list reorders. Never key by `index` for reorderable lists — use a real id.

### Never combine v-if with v-for on the same element

`v-if` has higher priority and cannot see the `v-for` loop variable. Filter with a `computed` instead:

```vue
<script setup>
import { ref, computed } from 'vue';
const todos = ref([]);
const pending = computed(() => todos.value.filter((t) => !t.done));
</script>

<template>
  <li v-for="todo in pending" :key="todo.id">{{ todo.name }}</li>
</template>
```

Or, when the condition truly varies per item, wrap the inner element:

```vue
<template v-for="todo in todos" :key="todo.id">
  <li v-if="!todo.done">{{ todo.name }}</li>
</template>
```

### Array change detection

Mutation methods trigger updates: `push` `pop` `shift` `unshift` `splice` `sort` `reverse`. Non-mutating methods return a new array — reassign the ref:

```vue
<script setup>
items.value = items.value.filter((i) => i.active);
</script>
```

Avoid mutating `sort()` / `reverse()` inside a `computed` — copy first: `[...items.value].reverse()`.

## v-html

Renders raw HTML and bypasses interpolation escaping — an XSS vector. Forbidden in this project unless the HTML is provably sanitized server-side. Prefer `{{ }}`.

➜ See skill: vuetify-components — for `v-text-field`, `v-select`, and other Vuetify inputs that wrap these directives.
