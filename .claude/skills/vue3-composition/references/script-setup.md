# `<script setup>` Syntax

## Basics

`<script setup>` is the compile-time syntactic sugar for Composition API. All top-level bindings (variables, functions, imports) are automatically available in the template.

```vue
<template>
  <button @click="increment">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>
```

No `export default`, no `setup()` function, no `return` statement needed.

## defineProps()

### Runtime declaration (used in this project)

```js
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array, default: () => [] },
  user: { type: Object, default: null },
});
```

### Type-based declaration (TypeScript projects)

```ts
const props = defineProps<{
  title: string;
  count?: number;
}>();
```

### Accessing props

```js
const props = defineProps({ modelValue: String });

const display = computed(() => props.modelValue.toUpperCase());
```

Props are reactive — use them directly in computed/watch. Do NOT destructure:

```js
const { title } = defineProps({ title: String });
```

This loses reactivity in Vue 3.4 and below. From Vue 3.5+, destructured props with `defineProps` are reactive.

## defineEmits()

```js
const emit = defineEmits(['update:modelValue', 'submit', 'close']);

function handleSubmit() {
  emit('submit', { data: formData.value });
}

function updateValue(val) {
  emit('update:modelValue', val);
}
```

### Validation (runtime)

```js
const emit = defineEmits({
  submit: (payload) => payload.data !== null,
  close: null,
});
```

## defineModel() — Vue 3.4+

Simplifies `v-model` binding. Replaces the `props + emit('update:modelValue')` pattern:

```vue
<script setup>
const model = defineModel();

const modelWithOptions = defineModel({ type: String, default: '' });

const named = defineModel('title', { type: String });
</script>
```

Equivalent to:

```js
const props = defineProps({ modelValue: String });
const emit = defineEmits(['update:modelValue']);
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
```

## defineExpose()

Exposes component internals to parent via template ref. **Not used in this project** but documented for completeness:

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);

function reset() {
  count.value = 0;
}

defineExpose({ count, reset });
</script>
```

Parent access:

```vue
<template>
  <Child ref="childRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const childRef = ref(null);

onMounted(() => {
  childRef.value.reset();
});
</script>
```

## useSlots() and useAttrs()

```js
import { useSlots, useAttrs } from 'vue';

const slots = useSlots();
const attrs = useAttrs();

const hasHeader = computed(() => !!slots.header);
```

`attrs` contains all non-prop, non-emit attributes passed to the component (class, style, event listeners from parent).

## Top-level await (with Suspense)

`<script setup>` supports top-level `await`. The component becomes an async dependency requiring `<Suspense>`:

```vue
<script setup>
const data = await fetchData();
</script>
```

**Not used in this project** — async data is fetched in `onMounted()` instead, which avoids Suspense complexity and works with SSR.

## Component imports

Imported components are automatically available in template:

```vue
<template>
  <AppHeader />
  <MainContent />
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import MainContent from '@/components/MainContent.vue';
</script>
```

No `components: {}` registration needed.

## Dynamic components

```vue
<template>
  <component :is="currentTab" />
</template>

<script setup>
import TabA from './TabA.vue';
import TabB from './TabB.vue';

const tabs = { TabA, TabB };
const currentTab = computed(() => tabs[activeTab.value]);
</script>
```
