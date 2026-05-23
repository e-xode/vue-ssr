# Watchers

## watch() — project standard

This project uses explicit `watch()` exclusively. No `watchEffect()`.

### Basic usage

```js
import { ref, watch } from 'vue';

const count = ref(0);

watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});
```

### Watching multiple sources

```js
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  fullName.value = `${newFirst} ${newLast}`;
});
```

### Watching a getter (computed expression)

```js
watch(
  () => route.params.id,
  (newId) => {
    fetchItem(newId);
  }
);
```

### Deep watching

For refs holding objects/arrays, deep watching is automatic:

```js
const user = ref({ name: '', email: '' });

watch(
  user,
  (newUser) => {
    // fires on any nested property change
  },
  { deep: true }
);
```

Without `{ deep: true }`, only full `.value` replacement triggers the watcher.

### Immediate execution

```js
watch(
  searchQuery,
  (query) => {
    fetchResults(query);
  },
  { immediate: true }
);
```

Fires immediately with the current value, then on every change.

## Common patterns in this project

### Route change watcher

```js
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

watch(
  () => route.params.locale,
  (newLocale) => {
    loadTranslations(newLocale);
  }
);
```

### Form validation on input

```js
const email = ref('');
const emailError = ref('');

watch(email, (val) => {
  emailError.value = val.includes('@') ? '' : t('errors.invalidEmail');
});
```

### Debounced search

```js
const query = ref('');
let timeout = null;

watch(query, (val) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    search(val);
  }, 300);
});
```

## watchEffect() — NOT used

For reference, `watchEffect()` auto-tracks reactive dependencies:

```js
watchEffect(() => {
  console.log(count.value);
});
```

This project prefers explicit `watch()` because:

- Dependencies are clearly stated in the source argument
- Easier to reason about what triggers the effect
- No accidental dependency tracking
- Clearer intent in code review

## Cleanup function

The callback receives an `onCleanup` function for cleaning up side effects from the previous run:

```js
watch(searchQuery, (query, oldQuery, onCleanup) => {
  const controller = new AbortController();

  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => {
      results.value = data;
    });

  onCleanup(() => {
    controller.abort();
  });
});
```

The cleanup runs:

- Before the next watcher execution
- When the component unmounts

## Stopping watchers

`watch()` returns a stop function:

```js
const stop = watch(source, callback);

stop();
```

Watchers created in `setup()` are automatically stopped on component unmount. Manual stopping is needed for watchers created conditionally or in callbacks.

## flush option

Controls when the watcher callback fires relative to DOM updates:

| Value             | When              | Use case                        |
| ----------------- | ----------------- | ------------------------------- |
| `'pre'` (default) | Before DOM update | Most cases                      |
| `'post'`          | After DOM update  | Need to read updated DOM        |
| `'sync'`          | Synchronously     | Rarely needed, performance cost |

```js
watch(
  count,
  (val) => {
    // DOM is updated here
    const el = document.getElementById('counter');
    console.log(el.textContent);
  },
  { flush: 'post' }
);
```

## Watcher pitfalls

### Watching .value instead of ref

```js
watch(count.value, cb);
```

This passes a plain number — it's NOT reactive. Always pass the ref itself or a getter:

```js
watch(count, cb);
watch(() => count.value, cb);
```

### Infinite loops

```js
watch(items, () => {
  items.value = items.value.filter((x) => x.active);
});
```

Modifying the watched source inside the callback causes infinite recursion. Use a different ref or add a guard condition.

### Deep watcher performance

`{ deep: true }` on large objects traverses the entire structure on every change. For large data:

- Use `shallowRef()` and replace entirely
- Watch a specific nested path: `watch(() => state.value.nested.prop, cb)`
