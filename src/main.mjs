import { io } from 'socket.io-client'
import buildApp from '@/app.mjs'

const { app, router, store } = buildApp()
const storeInitialState = window.INITIAL_DATA

if (storeInitialState) {
    store.replaceState(storeInitialState)
}
app.config.globalProperties.$socket = io(
    'localhost:3002',
    { secure:  process.env.NODE_ENV !== 'development' }
)
router.isReady().then(() => app.mount('#app', true))
