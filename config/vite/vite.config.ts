import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(baseDir, '../../client'),
  publicDir: path.resolve(baseDir, '../../client/public'),
  build: {
    outDir: path.resolve(baseDir, '../../dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(baseDir, '../../client/src'),
      '@server': path.resolve(baseDir, '../../server/src'),
      '@shared': path.resolve(baseDir, '../../shared'),
    },
  },
});
