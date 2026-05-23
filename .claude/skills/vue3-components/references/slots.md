# Slots

Slots let a parent inject template content into a child — the template equivalent of passing a render callback. Slot content compiles in the **parent's** scope; it can read parent state but not the child's internals (except via scoped slot props).

## Default slot + fallback

```vue
<template>
  <button class="action-btn">
    <slot>Submit</slot>
  </button>
</template>
```

`Submit` renders only when the parent provides no content.

```vue
<ActionButton>Save changes</ActionButton>
```

## Named slots

A child exposes multiple insertion points by name; the unnamed one is `default`.

```vue
<template>
  <article class="panel">
    <header><slot name="header" /></header>
    <div class="panel-body"><slot /></div>
    <footer><slot name="footer" /></footer>
  </article>
</template>
```

Parent uses `#name` (shorthand for `v-slot:name`):

```vue
<Panel>
  <template #header><h2>{{ t('panel.title') }}</h2></template>

  <p>{{ t('panel.body') }}</p>

  <template #footer><v-btn>{{ t('common.close') }}</v-btn></template>
</Panel>
```

## Conditional slots

Render wrapper markup only when the slot is actually filled. Read `$slots` in the template.

```vue
<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>
```

In `<script setup>`, the same check uses `useSlots()`:

```vue
<script setup>
import { useSlots, computed } from 'vue';

const slots = useSlots();
const hasFooter = computed(() => Boolean(slots.footer));
</script>
```

## Scoped slots — child → parent data

To let parent content read child-owned data, bind props on the `<slot>` element. The parent receives them through `v-slot`.

```vue
<template>
  <ul class="list">
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="items.indexOf(item)" />
    </li>
  </ul>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } });
</script>
```

Parent destructures the slot props:

```vue
<DataList :items="users">
  <template #default="{ item, index }">
    {{ index + 1 }}. {{ item.name }}
  </template>
</DataList>
```

### Named scoped slots

Combine a name with `v-bind` on the slot to forward an object.

```vue
<template>
  <table>
    <tr v-for="row in rows" :key="row.id">
      <slot name="row" v-bind="row" />
    </tr>
  </table>
</template>
```

```vue
<RowList :rows="rows">
  <template #row="{ name, email }">
    <td>{{ name }}</td><td>{{ email }}</td>
  </template>
</RowList>
```

➜ See skill: vuetify-components — Vuetify (`v-data-table`, `v-list`, `v-card`) exposes most of its API through named scoped slots; this is the most common slot usage in the project.

## Dynamic slot names

```vue
<template #[slotName]>
  {{ t('dynamic.content') }}
</template>
```

## Renderless components

A component that owns only logic and delegates all markup to a scoped slot. Prefer a composable (`useXxx`) for pure logic reuse; reach for a renderless component only when the logic must drive template structure.

```vue
<template>
  <slot :results="results" :loading="loading" />
</template>

<script setup>
import { ref } from 'vue';

const results = ref([]);
const loading = ref(false);
</script>
```

➜ See skill: vue3-reusability — composable vs renderless-component decision.

## SSR note

Slot content renders during `renderToString` on the server. Keep slot bodies free of browser-only access (`window`, `document`) at render time — the same SSR rules as any template.

## Pitfalls

| Pitfall                                        | Fix                             |
| ---------------------------------------------- | ------------------------------- |
| Slot content reads child state directly        | Expose it via scoped slot props |
| Wrapper markup renders empty when slot unused  | Guard with `v-if="$slots.name"` |
| Missing `:key` on slotted `v-for`              | Always bind a stable `:key`     |
| Building a renderless component for pure logic | Use a composable instead        |
