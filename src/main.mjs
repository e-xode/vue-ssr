import buildApp from '@/app.mjs'

const { app, router, store } = buildApp()
const storeInitialState = window.INITIAL_DATA

if (storeInitialState) {
    store.replaceState(storeInitialState)
}

router.isReady().then(() => app.mount('.app', true))
