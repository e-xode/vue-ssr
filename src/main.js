import { createSSRApp, createApp as createVueApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createApplicationVuetify } from './plugins/vuetify'
import en from '@/translate/en.json'
import fr from '@/translate/fr.json'
import { router } from './router'
import App from './App.vue'

const ssr = typeof window === 'undefined'

export function createApp() {
  const app = ssr
    ? createSSRApp(App)
    : createVueApp(App)

  const vuetify = createApplicationVuetify(ssr)
  const pinia = createPinia()

  const savedLocale = !ssr && localStorage.getItem('locale') ? localStorage.getItem('locale') : 'en'

  const i18n = createI18n({
    fallbackLocale: 'en',
    legacy: false,
    locale: savedLocale,
    messages: { en, fr }
  })

  app
    .use(router)
    .use(vuetify)
    .use(pinia)
    .use(i18n)

  return { app, router, pinia, i18n }
}
