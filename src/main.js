import { createSSRApp, createApp as createVueApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import '@fontsource-variable/inter/wght.css';
import interLatinFontUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import { createApplicationVuetify } from './plugins/vuetify';
import { DEFAULT_THEME, parseThemeCookie } from '@/shared/theme';
import { DEFAULT_LOCALE, LOCALE_CODES } from '@/shared/const';
import { reveal } from '@/directives/reveal';
import en from '@/translate/en.json';
import fr from '@/translate/fr.json';
import { createAppRouter } from './router';
import App from './App.vue';

const ssr = typeof window === 'undefined';

export { interLatinFontUrl };

function readSavedLocale() {
  if (ssr) return DEFAULT_LOCALE;
  const saved = localStorage.getItem('locale');
  return LOCALE_CODES.includes(saved) ? saved : DEFAULT_LOCALE;
}

export function createApp({
  theme: initialTheme,
  locale: initialLocale,
  initialState = null,
} = {}) {
  const app = ssr ? createSSRApp(App) : createVueApp(App);

  const theme = initialTheme || (ssr ? DEFAULT_THEME : parseThemeCookie(document.cookie));
  const startLocale = LOCALE_CODES.includes(initialLocale) ? initialLocale : readSavedLocale();
  const vuetify = createApplicationVuetify(ssr, theme, startLocale);
  const pinia = createPinia();
  if (initialState) pinia.state.value = initialState;

  const i18n = createI18n({
    fallbackLocale: DEFAULT_LOCALE,
    legacy: false,
    locale: startLocale,
    messages: { en, fr },
  });

  const router = createAppRouter({ pinia, hydrated: !!initialState });

  function setLocale(locale) {
    if (!LOCALE_CODES.includes(locale)) return;
    i18n.global.locale.value = locale;
    vuetify.locale.current.value = locale;
  }

  app.use(router).use(vuetify).use(pinia).use(i18n);
  app.directive('reveal', reveal);

  return { app, router, pinia, i18n, vuetify, setLocale };
}
