/**
 * Entry point backend: resolve config → buka DB → rakit app → listen.
 * Jalankan: `bun run dev` (watch) atau `bun run start`.
 */
import { createApp } from './app';
import { DEFAULT_ADMIN_PASSWORD, parseAdminPassword, resolveConfig } from './config';
import { createDb, resolveDbTarget } from './db/client';
import { createRepositories } from './repositories/drizzle';

const config = resolveConfig(process.env);
const target = resolveDbTarget(config.databaseUrl);

// Eksplisit: bila admin jalan dengan password fallback, operator tahu.
if (parseAdminPassword(process.env.ADMIN_PASSWORD) === DEFAULT_ADMIN_PASSWORD) {
  console.warn(
    '[admin] ADMIN_PASSWORD belum di-set di .env — memakai fallback "admin-dev". ' +
      'Ganti di server/.env sebelum dipakai di luar lokal.',
  );
}

const handle = await createDb(target);
const app = createApp({
  repos: createRepositories(handle.db),
  corsOrigins: config.corsOrigins,
  adminPassword: config.adminPassword,
});

try {
  app.listen(config.port);
  console.log(
    `API AI Center berjalan di http://localhost:${config.port}/api/health (db: ${target.kind})`,
  );
} catch (error) {
  console.error('Gagal menjalankan server:', error);
  await handle.close();
  process.exit(1);
}

/** Tutup koneksi rapi saat proses dihentikan. */
async function shutdown(signal: string): Promise<void> {
  console.log(`\nMenerima ${signal}, menutup server…`);
  await app.stop();
  await handle.close();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
