import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';

const baseDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/setup/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/e2e/**/*.test.ts',
    ],
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
      '@': path.resolve(baseDir, 'client/src'),
      '@server': path.resolve(baseDir, 'server/src'),
      '@shared': path.resolve(baseDir, 'shared'),
    },
  },
  esbuild: {
    target: 'node18',
  },
});
