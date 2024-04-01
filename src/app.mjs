import { createSSRApp, createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import vui from '@e-xode/vui'

import store from '@/store/store.mjs'
import { router } from '@/router.mjs'
import { messages } from '@/translate/index.mjs'
import App from '@/app.vue'

export default function mount(locale = 'en') {
    const i18n = new createI18n({
        legacy: false,
        locale,
        messages
    })
    const app = typeof window === 'undefined'
        ? createSSRApp(App)
        : createApp(App)

    app.use(router)
    app.use(i18n)
    app.use(store)
    app.use(vui)
    app.config.globalProperties.dayjs = dayjs

    return { app, router, store }
}
