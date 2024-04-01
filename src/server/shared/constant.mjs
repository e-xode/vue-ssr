const {
    NODE_ENV = 'production',
    NODE_PORT = 3002
} = process.env

const IS_PROD = NODE_ENV === 'production'

const VITE_OPTS = {
    appType: 'custom',
    config: '',
    base: '/',
    logLevel: 'info',
    root: process.cwd(),
    server: {
        middlewareMode: true,
        watch: {
            usePolling: true,
            interval: 100
        }
    }
}

export {
    IS_PROD,
    NODE_PORT,
    VITE_OPTS
}
