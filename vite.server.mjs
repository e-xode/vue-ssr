import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import pkg from './package.json' assert { type: 'json' }
const __dirname = dirname('./')

export default defineConfig({
    publicDir: resolve(__dirname, 'public'),
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
        }
    },
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: false,
        rollupOptions: {
            external: Object.keys(pkg.dependencies || {}),
            input: {
                server: 'src/server/server.mjs'
            },
            output: {
                entryFileNames: 'server.js'
            }
        }
    },
    plugins: [
        vue()
    ]
})
