import { io } from 'socket.io-client'
import { mount } from '@/app.mjs'
import { cssRemove } from '@/server/shared/css.mjs'

const data = JSON.parse(decodeURIComponent(window.__INITIAL_STATE__))
const { app, router, store } = mount(data.user.locale)
store.replaceState(data)

app.config.globalProperties.$socket = io(
    process.env.NODE_ENV !== 'production'
        ? `http://localhost:${process.env.NODE_PORT}`
        : `https://${location.hostname}`
)

router.isReady().then(() => app.mount('#app', true))
cssRemove()

export default app
