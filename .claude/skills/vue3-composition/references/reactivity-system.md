# Reactivity System

## ref() — the project standard

This project uses `ref()` exclusively for all reactive state. No `reactive()`.

```js
import { ref } from 'vue'

const count = ref(0)
const items = ref([])
const user = ref({ name: '', email: '' })
const isLoading = ref(false)
```

**Why ref() over reactive():**

- Explicit `.value` makes it clear when you're accessing reactive state in JS
- Can be reassigned: `items.value = newArray` (reactive cannot be reassigned)
- Works with primitives and objects uniformly
- Easier to pass around, return from composables, and destructure from returns
- No risk of losing reactivity when destructuring the composable return value

## reactive() — NOT used

```js
const state = reactive({ count: 0, name: '' })
```

Avoided because:
- Cannot reassign the whole object
- Destructuring loses reactivity: `const { count } = state` is plain value
- Mixing ref and reactive causes confusion
- No benefit over ref for objects

## shallowRef() — for large objects

When you have a large object that you replace entirely (never mutate deeply), use `shallowRef()` for performance:

```js
import { shallowRef, triggerRef } from 'vue'

const largeList = shallowRef([])

largeList.value = fetchedData

triggerRef(largeList)
```

Only the `.value` assignment is tracked. Deep mutations won't trigger updates unless you call `triggerRef()`.

## toRef() and toRefs() — prop decomposition

When you need to pass a single prop as a ref to a composable:

```js
import { toRef, toRefs } from 'vue'

const props = defineProps({ modelValue: String, disabled: Boolean })

const value = toRef(props, 'modelValue')

const { modelValue, disabled } = toRefs(props)
```

This maintains reactivity — the resulting refs stay connected to the prop source.

## computed() — derived state

Read-only computed (most common):

```js
import { computed } from 'vue'

const fullName = computed(() => `${first.value} ${last.value}`)

const isValid = computed(() => email.value.includes('@') && password.value.length >= 8)

const currentPage = computed(() => parseInt(route.query.page) || 1)
```

Writable computed (rare, use when you need two-way binding on derived state):

```js
const fullName = computed({
  get: () => `${first.value} ${last.value}`,
  set: (val) => {
    const [f, l] = val.split(' ')
    first.value = f
    last.value = l
  }
})
```

## Reactivity gotchas

### Losing reactivity on destructure

```js
const count = ref(0)
let { value } = count
value++
```

This does NOT update `count`. The number is copied by value.

### Ref unwrapping in templates

In `<template>`, refs are auto-unwrapped — no `.value` needed:

```vue
<template>
  <span>{{ count }}</span>       <!-- auto-unwrapped -->
  <span>{{ user.name }}</span>   <!-- deep access works -->
</template>

<script setup>
const count = ref(0)
const user = ref({ name: 'Alice' })
</script>
```

### Array/Object replacement vs mutation

Both trigger reactivity with `ref()`:

```js
const items = ref([1, 2, 3])

items.value.push(4)

items.value = items.value.filter(x => x > 2)
```

### Watching the ref, not the value

```js
watch(count, (newVal) => { ... })

watch(() => user.value.name, (newName) => { ... })
```

Never pass `count.value` to watch — that's a plain number, not a reactive source.

### Ref in reactive (unwrapping)

A ref inside a reactive object is automatically unwrapped:

```js
const state = reactive({ count: ref(0) })
state.count++
```

This project avoids this pattern entirely by not using reactive().
