import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LOCALE_CODES, DEFAULT_LOCALE } from '@/shared/const'

export function useLocalePath() {
  const route = useRoute()
  const router = useRouter()
  const { locale: i18nLocale } = useI18n()
  const locale = computed(() => route.params.locale || DEFAULT_LOCALE)

  function localePath(path) {
    const loc = locale.value
    if (path === '/') return `/${loc}`
    return `/${loc}${path.startsWith('/') ? path : '/' + path}`
  }

  function switchLocale(code) {
    if (!LOCALE_CODES.includes(code)) return
    i18nLocale.value = code
    localStorage.setItem('locale', code)
    const newPath = route.path.replace(`/${locale.value}`, `/${code}`)
    router.push({ path: newPath, query: route.query, hash: route.hash })
  }

  return { locale, localePath, switchLocale }
}
