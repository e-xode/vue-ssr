import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname('./')

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@',
                replacement: resolve(__dirname, 'src'),
            },
            {
                find: 'vue-i18n',
                replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
            }
        ]
    },
    build: {
        outDir: resolve(__dirname, 'dist/server'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                ssr: 'src/server/ssr.mjs'
            },
            output: {
                entryFileNames: '[name].js'
            }
        }
    },
    plugins: [
        vue()
    ]
})
