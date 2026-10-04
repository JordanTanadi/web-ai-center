import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

// Basis deploy: disajikan dari subfolder XAMPP (/coding/Web-AI-Center/).
const BASE = '/coding/Web-AI-Center/';

// Peta modul rute lazy → path rute yang memicunya (dipakai plugin di bawah).
const RUTE_LAZY: Record<string, string[]> = {
  'src/pages/Beranda.tsx': ['/beranda'],
  'src/pages/PelatihanDetail.tsx': ['/layanan/pelatihan/'],
};

/**
 * Plugin: sisipkan `window.__PETA_CHUNK` (peta rute → URL chunk, sudah
 * termasuk hash build) ke index.html. Script inline di index.html memakai peta
 * ini untuk `modulepreload` chunk rute SEBELUM React merendernya — tanpa ini
 * konten rute menunggu rantai dynamic-import berurutan (selisih FCP→LCP ±2 detik
 * di throttling mobile Lighthouse). Hanya jalan saat build; dev tanpa peta (aman).
 */
function petaChunkRute(base: string): Plugin {
  return {
    name: 'peta-chunk-rute',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return undefined;
      const peta: Record<string, string[]> = {};
      for (const [modul, rutes] of Object.entries(RUTE_LAZY)) {
        const entry = Object.values(bundle).find(
          (c) =>
            c.type === 'chunk' &&
            c.facadeModuleId !== null &&
            c.facadeModuleId.replace(/\\/g, '/').endsWith(modul),
        );
        if (!entry || entry.type !== 'chunk') continue;
        // Kumpulkan chunk entry + semua import yang dicapainya (rekursif).
        const urls = new Set<string>();
        const antre = [entry];
        const kunjung = new Set<string>();
        while (antre.length > 0) {
          const c = antre.pop();
          if (!c || kunjung.has(c.fileName)) continue;
          kunjung.add(c.fileName);
          urls.add(base + c.fileName);
          for (const nama of [...c.dynamicImports, ...c.imports]) {
            const next = bundle[nama];
            // Chunk entry (React runtime) sudah dipreload Vite sendiri; dilewati
            // supaya rekursi tidak ikut menarik seluruh rute lazy lewat dynamic
            // import milik entry (boros bandwidth — merusak skor yang dituju).
            if (next && next.type === 'chunk' && !next.isEntry) antre.push(next);
          }
        }
        for (const r of rutes) peta[r] = [...urls];
      }
      return [
        {
          tag: 'script',
          injectTo: 'head',
          children: `window.__PETA_CHUNK=${JSON.stringify(peta)};`,
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => ({
  base: BASE,
  plugins: [react(), tailwindcss(), petaChunkRute(BASE)],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // Batasi ke frontend saja — test backend memakai bun:test (di-server/),
    // jangan dijalankan vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'server/**', 'dist/**'],
  },
}));
