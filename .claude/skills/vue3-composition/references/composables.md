# Composables

## Pattern

A composable is a function prefixed with `use` that encapsulates reusable stateful logic using the Composition API.

```js
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useXxx() {
  const state = ref(initialValue)
  const derived = computed(() => transform(state.value))

  function doSomething() {
    state.value = newValue
  }

  return { state, derived, doSomething }
}
```

**Rules:**
- Named `useXxx` (camelCase with `use` prefix)
- Exported as named function
- Returns plain object with reactive state and methods
- Can use lifecycle hooks (onMounted, onUnmounted)
- Can use other composables
- Located in `src/composables/`

## Project composables

### useLocalePath()

Locale-aware route building for the i18n routing system.

```js
import { useLocalePath } from '@/composables/useLocalePath'

const { locale, localePath, switchLocale } = useLocalePath()

const dashboardLink = localePath('/dashboard')

switchLocale('fr')
```

**Returns:**
- `locale` — computed ref of current locale from route params
- `localePath(path)` — prepends locale prefix to path
- `switchLocale(code)` — changes locale, updates localStorage, navigates

**Implementation notes:**
- Uses `useRoute()`, `useRouter()`, `useI18n()` internally
- `switchLocale` accesses `localStorage` (browser-only, but only called on user action)

### useCaptcha()

reCAPTCHA v3 integration for form submissions.

```js
import { useCaptcha } from '@/composables/useCaptcha'

const { executeRecaptcha } = useCaptcha()

async function handleSubmit() {
  const token = await executeRecaptcha('login')
  await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ ...formData, captchaToken: token })
  })
}
```

**Returns:**
- `executeRecaptcha(action)` — loads script if needed, returns token or null on server

**SSR safety:**
- Guards with `typeof window === 'undefined'` — returns null during SSR
- Lazy-loads the reCAPTCHA script on first call
- Module-level state (`scriptLoaded`, `scriptLoading`) shared across instances

## Authoring best practices

### Single responsibility

Each composable should do ONE thing:

```js
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => { count.value = initial }
  return { count, increment, decrement, reset }
}
```

### SSR-safe composables

Guard browser APIs. Never access them at the top level of setup:

```js
export function useMediaQuery(query) {
  const matches = ref(false)

  onMounted(() => {
    const mql = window.matchMedia(query)
    matches.value = mql.matches

    function handler(e) {
      matches.value = e.matches
    }

    mql.addEventListener('change', handler)
    onUnmounted(() => mql.removeEventListener('change', handler))
  })

  return { matches }
}
```

### Cleanup in onUnmounted

Always clean up subscriptions, listeners, timers:

```js
export function useInterval(callback, ms) {
  let id = null

  onMounted(() => {
    id = setInterval(callback, ms)
  })

  onUnmounted(() => {
    if (id !== null) clearInterval(id)
  })
}
```

### Accepting ref arguments

Composables can accept refs as arguments for reactive inputs:

```js
import { watch, isRef, unref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const loading = ref(true)

  async function doFetch() {
    loading.value = true
    const response = await fetch(unref(url))
    data.value = await response.json()
    loading.value = false
  }

  if (isRef(url)) {
    watch(url, doFetch, { immediate: true })
  } else {
    onMounted(doFetch)
  }

  return { data, loading }
}
```

### Composable composition

Composables can use other composables:

```js
export function useAuthenticatedFetch() {
  const { locale } = useLocalePath()

  async function authFetch(path, options = {}) {
    const url = `/api${path}`
    const headers = {
      'Accept-Language': locale.value,
      ...options.headers
    }
    return apiFetch(url, { ...options, headers })
  }

  return { authFetch }
}
```

## File organization

```
src/composables/
├── useLocalePath.js    ← locale-aware routing
├── useCaptcha.js       ← reCAPTCHA v3 integration
└── useXxx.js           ← one file per composable
```

Each composable gets its own file. Name matches the exported function.
