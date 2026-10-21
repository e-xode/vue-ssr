import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, ref } from 'vue';

const route = reactive({
  params: { locale: 'fr' },
  path: '/fr/contact',
  query: { a: '1' },
  hash: '',
});
const push = vi.fn();
const i18nLocale = ref('fr');

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: i18nLocale }),
}));

import { useLocalePath } from '@/composables/useLocalePath';

describe('composables/useLocalePath.js', () => {
  beforeEach(() => {
    push.mockClear();
    window.localStorage.clear();
    route.params.locale = 'fr';
    route.path = '/fr/contact';
    i18nLocale.value = 'fr';
  });

  it('prefixes paths with the current locale', () => {
    const { localePath } = useLocalePath();

    expect(localePath('/')).toBe('/fr');
    expect(localePath('')).toBe('/fr');
    expect(localePath('/signin')).toBe('/fr/signin');
    expect(localePath('dashboard')).toBe('/fr/dashboard');
    expect(localePath('/contact')).toBe('/fr/contact');
  });

  it('falls back to the default locale without a route locale', () => {
    route.params.locale = undefined;
    const { localePath, locale } = useLocalePath();

    expect(locale.value).toBe('en');
    expect(localePath('/signin')).toBe('/en/signin');
  });

  it('switches the locale, stores it and keeps query and hash', () => {
    const { switchLocale } = useLocalePath();

    switchLocale('en');

    expect(i18nLocale.value).toBe('en');
    expect(window.localStorage.getItem('locale')).toBe('en');
    expect(push).toHaveBeenCalledWith({ path: '/en/contact', query: { a: '1' }, hash: '' });
  });

  it('ignores an unsupported locale', () => {
    const { switchLocale } = useLocalePath();

    switchLocale('de');

    expect(push).not.toHaveBeenCalled();
    expect(i18nLocale.value).toBe('fr');
  });
});
