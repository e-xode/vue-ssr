import { createSSRApp, createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import vui from '@e-xode/vui'

import { router } from '@/router.mjs'
import store from '@/store/store.mjs'
import { en, fr } from '@/translate/index.mjs'

import App from '@/app.vue'

export default function buildApp() {
    const i18n = new createI18n({
        legacy: false,
        locale: 'en',
        messages: { en, fr }
    })
    const app = typeof window === 'undefined'
        ? createSSRApp(App)
        : createApp(App)

    app.use(router)
    app.use(store)
    app.use(i18n)
    app.use(vui)
    app.config.globalProperties.dayjs = dayjs

    return { app, router, store }
}
