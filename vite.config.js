import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const srcPath = resolve(__dirname, 'src');
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
      {
        find: '@root',
        replacement: resolve(__dirname),
      },
      {
        find: /^#src\//,
        replacement: `${srcPath}/`,
      },
    ],
  },
  build: {
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "${srcPath.replace(/\\/g, '/')}/styles/inject" as *;\n`,
      },
    },
  },
  server: {
    allowedHosts,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
    warmup: {
      ssrFiles: ['./src/entry-server.js'],
    },
  },
  ssr: {
    noExternal: ['vuetify'],
  },
});
