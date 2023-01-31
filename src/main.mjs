import { io } from 'socket.io-client'
import buildApp from '@/app.mjs'
import { cssRemove } from '@/server/shared/css.mjs'


const { app, router, store } = buildApp()
const storeInitialState = window.INITIAL_DATA

if (storeInitialState) {
    store.replaceState(storeInitialState)
}

app.config.globalProperties.$socket = io(
    process.env.NODE_ENV !== 'production'
        ? 'http://localhost:3002'
        : `https://${location.hostname}`
)

router.isReady().then(() => app.mount('#app', true))
cssRemove()
