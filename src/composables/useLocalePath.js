import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useLocalePath() {
  const route = useRoute()
  const router = useRouter()
  const locale = computed(() => route.params.locale || 'en')

  function localePath(path) {
    return `/${locale.value}${path}`
  }

  function switchLocale(newLocale) {
    const newPath = route.path.replace(`/${locale.value}`, `/${newLocale}`)
    router.push({ path: newPath, query: route.query, hash: route.hash })
  }

  return { locale, localePath, switchLocale }
}
