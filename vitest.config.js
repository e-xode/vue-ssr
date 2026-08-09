import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
      {
        find: '#src',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.config.js', '**/mockData.js'],
    },
    // 🚨 `*.spec.js` et `__tests__/` sont inclus délibérément : ce sont des conventions
    // courantes, et un test écrit ainsi était jusqu'ici ignoré EN SILENCE — vitest ne signale
    // pas un fichier non collecté. Un filet de sécurité qui se réduit sans prévenir est pire
    // qu'une absence de filet, surtout pendant une campagne de mise à jour de dépendances.
    include: [
      'tests/**/*.{test,spec}.js',
      'src/**/*.{test,spec}.js',
      '**/__tests__/**/*.{test,spec}.js',
    ],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
});
