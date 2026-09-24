/**
 * Pabrik koneksi database.
 * - `DATABASE_URL` terisi  → PostgreSQL asli (drizzle-orm/node-postgres + pg).
 * - `DATABASE_URL` kosong  → PGlite (Postgres in-process) untuk development
 *                            tanpa instalasi server DB.
 */
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { Pool } from 'pg';

export type DbTarget =
  | { kind: 'postgres'; url: string }
  | { kind: 'pglite'; dataDir: string };

/** Folder data PGlite (development) — di-gitignore. */
export const DEFAULT_PGDATA_DIR = resolve(import.meta.dir, '../../.pglite');

/**
 * Kedua driver Drizzle punya API query identik tetapi tipe kelas berbeda,
 * dan Drizzle tidak mengekspos tipe "database generik". Kita pakai irisan
 * keduanya sebagai tipe tunggal; jahitan casting ada di `createDb` saja.
 */
export type Db = PgliteDatabase<Record<string, never>> &
  NodePgDatabase<Record<string, never>>;

export interface DbHandle {
  db: Db;
  /** Tutup koneksi/pool — wajib dipanggil saat selesai. */
  close: () => Promise<void>;
}

/** Pilih target DB: `null` → PGlite lokal; selain itu → PostgreSQL. */
export function resolveDbTarget(
  databaseUrl: string | null,
  dataDir: string = DEFAULT_PGDATA_DIR,
): DbTarget {
  return databaseUrl === null
    ? { kind: 'pglite', dataDir }
    : { kind: 'postgres', url: databaseUrl };
}

/** Buka koneksi sesuai target; error dibiarkan muncul ke pemanggil (tidak silent). */
export async function createDb(target: DbTarget): Promise<DbHandle> {
  if (target.kind === 'pglite') {
    const client = new PGlite(target.dataDir);
    const db = drizzlePglite(client);
    return {
      db: db as unknown as Db,
      close: () => client.close(),
    };
  }

  const pool = new Pool({ connectionString: target.url, max: 10 });
  const db = drizzleNodePg(pool);
  return {
    db: db as unknown as Db,
    close: () => pool.end(),
  };
}
