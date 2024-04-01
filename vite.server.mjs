import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname('./')

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@',
                replacement: resolve(__dirname, 'src')
            },
            {
                find: '#src',
                replacement: resolve(__dirname, 'src')
            },
            {
                find: '/src',
                replacement: resolve(__dirname, 'src')
            }
        ]
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: {
                ssr: 'src/server/ssr.mjs'
            },
            output: {
                entryFileNames: '[name].js'
            }
        },
        outDir: resolve(__dirname, 'dist/server')
    },
    plugins: [
        vue()
    ]
})
