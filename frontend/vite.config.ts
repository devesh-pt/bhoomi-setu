import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || process.env.BASE_URL || './',
  build: {
    target: ['es2020', 'safari15'],
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true
  },
  test: {
    exclude: ['e2e/**', 'node_modules/**']
  }
});
