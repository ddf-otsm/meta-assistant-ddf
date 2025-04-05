import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'client/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'server/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'shared/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      include: [
        'client/src/**/*.{js,ts,jsx,tsx}',
        'server/src/**/*.{js,ts,jsx,tsx}',
        'shared/src/**/*.{js,ts,jsx,tsx}'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
    },
    typecheck: {
      tsconfig: './tsconfig.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@contexts': path.resolve(__dirname, './client/src/contexts'),
      '@types': path.resolve(__dirname, './client/src/types'),
      '@shared': path.resolve(__dirname, './shared/src'),
      '@server': path.resolve(__dirname, './server/src')
    },
  },
});
