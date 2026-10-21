import './style.css';

import { createApp } from './main';
import { LOCALE_CODES } from '@/shared/const';
import { initAnalytics, trackPageView } from '@/shared/analytics';
import { buildTitle } from '@/shared/title';
import { readSsrState } from '@/shared/ssrState';
import { APP_NAME_META_SELECTOR } from '@/shared/clientConstants';

const { app, router, i18n, setLocale } = createApp({ initialState: readSsrState() });

function readAppName() {
  return document.querySelector(APP_NAME_META_SELECTOR)?.content ?? '';
}

function syncLocale(route) {
  const locale = route.params.locale;
  if (locale && LOCALE_CODES.includes(locale)) {
    setLocale(locale);
    localStorage.setItem('locale', locale);
  }
}

function syncTitle(route) {
  if (!route.meta?.title) return document.title;
  const title = buildTitle(i18n.global.t(route.meta.title), readAppName());
  document.title = title;
  return title;
}

initAnalytics();

router.afterEach((to) => {
  syncLocale(to);
  trackPageView(to.fullPath, syncTitle(to));
});

router.isReady().then(() => {
  syncLocale(router.currentRoute.value);
  app.mount('#app');
});
