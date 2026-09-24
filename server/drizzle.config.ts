import { defineConfig } from 'drizzle-kit';

/**
 * Konfigurasi drizzle-kit untuk generate file migrasi SQL (offline, tanpa koneksi DB).
 * Jalankan: `bun run db:generate` → hasilnya di folder `drizzle/`.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
});
