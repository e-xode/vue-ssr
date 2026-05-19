# Lifecycle Hooks

## Execution order

```
setup()              ← runs on BOTH server and client
  onBeforeMount()    ← client only
  onMounted()        ← client only (DOM available)
  onBeforeUpdate()   ← client only (before re-render)
  onUpdated()        ← client only (after re-render)
  onBeforeUnmount()  ← client only (component tearing down)
  onUnmounted()      ← client only (component removed)
```

## SSR execution model

**Server:** Only `setup()` runs. No lifecycle hooks fire. No DOM exists.

**Client (hydration):** After SSR HTML is delivered, the client hydrates. During hydration, `setup()` runs again, then `onMounted()` fires.

**Rule:** Anything that needs `window`, `document`, `localStorage`, or DOM manipulation MUST go in `onMounted()` or later.

## Common patterns

### Fetch data on mount

```js
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/shared/apiFetch'

const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  const res = await apiFetch('/api/items')
  if (res.ok) {
    data.value = await res.json()
  }
  loading.value = false
})
```

### Event listener with cleanup

```js
import { onMounted, onUnmounted } from 'vue'

function handleResize() {
  // ...
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

### Timer with cleanup

```js
import { ref, onMounted, onUnmounted } from 'vue'

const elapsed = ref(0)
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    elapsed.value++
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
```

### Keyboard shortcut

```js
import { onMounted, onUnmounted } from 'vue'

function handleKey(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
})
```

## nextTick() — DOM updates

Vue batches DOM updates. After changing reactive state, the DOM hasn't updated yet in the same tick. Use `nextTick()` to wait:

```js
import { ref, nextTick } from 'vue'

const message = ref('')
const inputEl = ref(null)

async function addItem() {
  message.value = 'New item'
  await nextTick()
  inputEl.value.focus()
}
```

### Multi-input focus management

Common in this project for forms with dynamic fields:

```js
import { ref, nextTick } from 'vue'

const inputs = ref([])
const values = ref([''])

async function addField() {
  values.value.push('')
  await nextTick()
  const lastIndex = inputs.value.length - 1
  inputs.value[lastIndex]?.focus()
}
```

## Hooks NOT used in this project

| Hook | Reason |
| --- | --- |
| `onBeforeMount` | No use case — setup handles pre-mount logic |
| `onBeforeUpdate` | No use case — computed handles derived state |
| `onUpdated` | Risky (infinite loops) — prefer watch or nextTick |
| `onActivated` / `onDeactivated` | No `<KeepAlive>` usage |
| `onErrorCaptured` | Not implemented at component level |
| `onRenderTracked` / `onRenderTriggered` | Dev-only debugging, not committed |

## SSR-safe checklist

Before writing any lifecycle code, verify:

1. Does this need the DOM? → `onMounted()`
2. Does this use `window`/`document`/`localStorage`? → `onMounted()` or guard
3. Is this a subscription that needs cleanup? → pair `onMounted()` + `onUnmounted()`
4. Does this run async code that might resolve after unmount? → check component is still alive or use abort controller
