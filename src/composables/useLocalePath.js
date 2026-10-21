import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { LOCALE_CODES, DEFAULT_LOCALE } from '@/shared/const';
import { localizeSubPath } from '@/shared/localizedRoutes';

export function useLocalePath() {
  const route = useRoute();
  const router = useRouter();
  const { locale: i18nLocale } = useI18n();
  const locale = computed(() => route.params.locale || DEFAULT_LOCALE);

  function localePath(path) {
    const loc = locale.value;
    if (path === '/' || path === '') return `/${loc}`;
    const subPath = path.startsWith('/') ? path : `/${path}`;
    return `/${loc}${localizeSubPath(subPath, loc)}`;
  }

  function switchLocale(code) {
    if (!LOCALE_CODES.includes(code)) return;
    const currentSubPath = route.path.replace(`/${locale.value}`, '');
    i18nLocale.value = code;
    localStorage.setItem('locale', code);
    router.push({
      path: `/${code}${localizeSubPath(currentSubPath, code)}`,
      query: route.query,
      hash: route.hash,
    });
  }

  return { locale, localePath, switchLocale };
}
