import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // Disajikan dari subfolder XAMPP (/coding/Web-AI-Center/): aset build
  // (JS/CSS) memakai basis ini; path public di kode TS mengikuti via
  // src/lib/basis.ts agar dev (/) dan build tetap jalan.
  base: '/coding/Web-AI-Center/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // Batasi ke frontend saja — test backend memakai bun:test (di-server/),
    // jangan dijalankan vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'server/**', 'dist/**'],
  },
});
