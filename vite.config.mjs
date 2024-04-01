import { dirname, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname('./')

export default defineConfig({
    define: {
        'process.env': process.env
    },
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
        manifest: true,
        cssCodeSplit: false,
        outDir: resolve(__dirname, 'dist/client')
    },
    plugins: [
        vue()
    ]
})
