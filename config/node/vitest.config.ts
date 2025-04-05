import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

// Using process.cwd() instead of import.meta.url to avoid ESM issues
const projectRoot = process.cwd();

export default defineConfig({
  plugins: [react() as any], // Type assertion needed due to version mismatch between vite and vitest
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
      '@': path.resolve(projectRoot, './client/src'),
      '@components': path.resolve(projectRoot, './client/src/components'),
      '@lib': path.resolve(projectRoot, './client/src/lib'),
      '@hooks': path.resolve(projectRoot, './client/src/hooks'),
      '@contexts': path.resolve(projectRoot, './client/src/contexts'),
      '@types': path.resolve(projectRoot, './client/src/types'),
      '@shared': path.resolve(projectRoot, './shared/src'),
      '@server': path.resolve(projectRoot, './server/src')
    },
  },
} as UserConfig);
