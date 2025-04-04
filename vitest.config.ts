import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.ts', 'server/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.{js,ts,jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@server': path.resolve(__dirname, 'server/src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});
