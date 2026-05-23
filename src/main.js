import { createSSRApp, createApp as createVueApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import { createApplicationVuetify } from './plugins/vuetify';
import { DEFAULT_THEME, parseThemeCookie } from '@/shared/theme';
import en from '@/translate/en.json';
import fr from '@/translate/fr.json';
import { router } from './router';
import App from './App.vue';

const ssr = typeof window === 'undefined';

export function createApp(initialTheme) {
  const app = ssr ? createSSRApp(App) : createVueApp(App);

  const theme = initialTheme || (ssr ? DEFAULT_THEME : parseThemeCookie(document.cookie));
  const vuetify = createApplicationVuetify(ssr, theme);
  const pinia = createPinia();

  const savedLocale =
    !ssr && localStorage.getItem('locale') ? localStorage.getItem('locale') : 'en';

  const i18n = createI18n({
    fallbackLocale: 'en',
    legacy: false,
    locale: savedLocale,
    messages: { en, fr },
  });

  app.use(router).use(vuetify).use(pinia).use(i18n);

  return { app, router, pinia, i18n };
}
