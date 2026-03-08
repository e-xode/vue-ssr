import './style.css'

import { createApp } from './main'
import { LOCALE_CODES } from '@/shared/const'

const { app, router, i18n } = createApp()

router.afterEach((to) => {
  const locale = to.params.locale
  if (locale && LOCALE_CODES.includes(locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }
})

router.isReady().then(() => {
  const locale = router.currentRoute.value.params.locale
  if (locale && LOCALE_CODES.includes(locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }
  app.mount('#app')
})
