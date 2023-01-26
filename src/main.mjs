import { io } from 'socket.io-client'
import { cssRemove } from '@/server/shared/css.mjs'
import buildApp from '@/app.mjs'

cssRemove()

const { app, router, store } = buildApp()
const storeInitialState = window.INITIAL_DATA

if (storeInitialState) {
    store.replaceState(storeInitialState)
}

app.config.globalProperties.$socket = io(
    '0.0.0.0:3002',
    { secure:  process.env.NODE_ENV !== 'development' }
)

router.isReady().then(() => app.mount('#app', true))
