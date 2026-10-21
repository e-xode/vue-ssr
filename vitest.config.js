import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const serverTestFiles = ['tests/unit/api.*.test.js', 'tests/unit/shared.*.test.js'];
const browserDependentSharedTestFiles = [
  'tests/unit/shared.analytics*.test.js',
  'tests/unit/shared.theme*.test.js',
  'tests/unit/shared.ssrState*.test.js',
];
const clientTestFiles = [
  'tests/unit/**/*.{test,spec}.js',
  'src/**/*.{test,spec}.js',
  '**/__tests__/**/*.{test,spec}.js',
];
const ignoredPaths = ['node_modules', 'dist', '.idea', '.git', '.cache'];

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
    setupFiles: ['./tests/setup.js'],
    mockReset: true,
    restoreMocks: true,
    reporters: ['default', 'hanging-process'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.config.js', '**/mockData.js'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: serverTestFiles,
          exclude: [...ignoredPaths, ...browserDependentSharedTestFiles],
        },
      },
      {
        extends: true,
        test: {
          name: 'client',
          environment: 'happy-dom',
          include: clientTestFiles,
          exclude: [
            ...ignoredPaths,
            'tests/unit/api.*.test.js',
            'tests/unit/shared.!(analytics*|theme*|ssrState*).test.js',
          ],
        },
      },
    ],
  },
});
