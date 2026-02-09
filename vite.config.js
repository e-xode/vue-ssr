import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const srcPath = resolve(__dirname, 'src');

export default defineConfig({
  plugins: [vue()],
  resolve: {
      alias: [
          {
              find: '@',
              replacement: resolve(__dirname, 'src')
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
