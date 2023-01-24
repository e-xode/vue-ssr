import { createSSRApp, createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import vui from '@e-xode/vui/dist/vui.esm.js'

import store from '@/store/store.mjs'
import { router } from '@/router.mjs'
import { en, fr } from '@/translate/index.mjs'
import App from '@/app.vue'

export default function build() {
    const i18n = new createI18n({
        legacy: false,
        locale: 'en',
        messages: { en, fr }
    })
    const app = typeof window === 'undefined'
        ? createSSRApp(App)
        : createApp(App)
    app.use(router)
    app.use(i18n)
    app.use(store)
    app.use(vui)
    return { app, router, store }
}
