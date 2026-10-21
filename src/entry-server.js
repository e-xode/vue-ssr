import './style.css';
import { renderToString } from 'vue/server-renderer';
import { createApp, interLatinFontUrl } from './main';
import { generateHead } from './ssr/head';
import { LOCALE_CODES, DEFAULT_LOCALE } from './shared/const';

function localeFromUrl(url) {
  const [segment] = url.replace(/^\/+/, '').split(/[/?#]/);
  return LOCALE_CODES.includes(segment) ? segment : DEFAULT_LOCALE;
}

async function runPrefetch(route, pinia, ssrContext) {
  if (typeof route.meta?.prefetch !== 'function') return false;
  try {
    await route.meta.prefetch({ route, pinia, ssrContext });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function render(url, db, theme) {
  const ssrContext = { db };
  const { app, router, pinia, i18n, setLocale } = createApp({
    theme,
    locale: localeFromUrl(url),
  });

  await router.push(url);
  await router.isReady();

  const route = router.currentRoute.value;
  const locale = route.params.locale || localeFromUrl(url);
  setLocale(locale);

  const prefetched = await runPrefetch(route, pinia, ssrContext);
  const html = await renderToString(app, ssrContext);
  const statusCode = ssrContext.statusCode || route.meta?.statusCode || 200;

  const head = generateHead({
    route,
    router,
    locale,
    t: i18n.global.t,
    theme,
    statusCode,
    env: process.env,
    fontPreloadUrl: interLatinFontUrl,
  });

  return { html, head, locale, statusCode, state: prefetched ? pinia.state.value : null };
}
