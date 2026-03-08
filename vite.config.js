import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const srcPath = resolve(__dirname, 'src')
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  resolve: {
      alias: [
          {
              find: '@',
              replacement: resolve(__dirname, 'src')
          },
          {
              find: '@root',
              replacement: resolve(__dirname)
          }
      ]
  },
  build: {
      cssCodeSplit: false,
      rollupOptions: {
          output: {
              assetFileNames: 'assets/[name]-[hash][extname]'
          }
      }
  },
  css: {
      devSourcemap: true,
      preprocessorOptions: {
          scss: {
              api: 'modern-compiler',
              additionalData: `@use "${srcPath.replace(/\\/g, '/')}/styles/variables" as *;\n@use "${srcPath.replace(/\\/g, '/')}/styles/mixins" as *;\n`
          }
      }
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  ssr: {
    noExternal: [
      'vuetify'
    ]
  }
})
