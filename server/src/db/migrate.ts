/**
 * Migration runner — menjalankan file SQL hasil `drizzle-kit generate`.
 * Logika orkestrasi murni di `runMigrations` (uji unit pakai fake store);
 * akses DB disentuh lewat port kecil `MigrationStore` (implementasi tipis di bawah).
 *
 * Jalankan langsung: `bun run db:migrate`.
 */
import { resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import type { Db } from './client';
import { createDb } from './client';
import { resolveConfig } from '../config';

/** Pemisah pernyataan pada file migrasi hasil drizzle-kit. */
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';

export interface MigrationFile {
  /** Nama file (unik, jadi kunci di tabel `_migrations`). */
  name: string;
  /** Isi file SQL. */
  sql: string;
}

/** Port akses DB kecil khusus migrasi — supaya orkestrasi bisa diuji tanpa DB. */
export interface MigrationStore {
  ensureTable: () => Promise<void>;
  listApplied: () => Promise<string[]>;
  markApplied: (name: string) => Promise<void>;
  runStatement: (statement: string) => Promise<void>;
}

/** Pecah isi file migrasi menjadi pernyataan SQL individual. */
export function splitStatements(rawSql: string): string[] {
  return rawSql
    .split(STATEMENT_BREAKPOINT)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

/**
 * Ambil migrasi yang belum dijalankan.
 * `available` harus sudah terurut (urutan eksekusi dijaga pemanggil).
 */
export function pickPendingMigrations(
  available: string[],
  applied: string[],
): string[] {
  const appliedSet = new Set(applied);
  return available.filter((name) => !appliedSet.has(name));
}

/**
 * Jalankan migrasi tertunda; idempoten (nama sudah tercatat → dilewati).
 * @returns daftar migrasi yang dijalankan pada sesi ini (urut).
 */
export async function runMigrations(
  store: MigrationStore,
  migrations: MigrationFile[],
): Promise<string[]> {
  await store.ensureTable();
  const applied = await store.listApplied();
  const available = migrations.map((migration) => migration.name);
  const pendingNames = pickPendingMigrations(available, applied);

  const pendingSet = new Set(pendingNames);
  const appliedNow: string[] = [];
  for (const migration of migrations) {
    if (!pendingSet.has(migration.name)) continue;
    for (const statement of splitStatements(migration.sql)) {
      await store.runStatement(statement);
    }
    await store.markApplied(migration.name);
    appliedNow.push(migration.name);
  }
  return appliedNow;
}

/**
 * Bentuk hasil `db.execute` berbeda antara driver (type-level),
 * tetapi keduanya selalu punya `.rows` — dinormalkan di satu tempat ini.
 */
interface RowsResult {
  rows: Array<{ name: string }>;
}

/** Implementasi `MigrationStore` di atas koneksi Drizzle. */
export function createMigrationStore(db: Db): MigrationStore {
  return {
    async ensureTable() {
      await db.execute(
        sql.raw(
          'CREATE TABLE IF NOT EXISTS "_migrations" ("name" text PRIMARY KEY, "applied_at" timestamptz NOT NULL DEFAULT now())',
        ),
      );
    },
    async listApplied() {
      const result = await db.execute(
        sql`select "name" from "_migrations" order by "name"`,
      );
      const { rows } = result as unknown as RowsResult;
      return rows.map((row) => row.name);
    },
    async markApplied(name) {
      await db.execute(
        sql`insert into "_migrations" ("name") values (${name}) on conflict do nothing`,
      );
    },
    async runStatement(statement) {
      await db.execute(sql.raw(statement));
    },
  };
}

/** Baca semua file `.sql` di folder drizzle (terurut nama file). */
async function loadMigrations(dir: string): Promise<MigrationFile[]> {
  const { readdir, readFile } = await import('node:fs/promises');
  const entries = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
  return Promise.all(
    entries.map(async (name) => ({
      name,
      sql: await readFile(`${dir}/${name}`, 'utf8'),
    })),
  );
}

/** CLI: `bun run db:migrate` — exit code 1 bila gagal (tidak silent). */
if (import.meta.main) {
  const config = resolveConfig(process.env);
  const migrationDir = resolve(import.meta.dir, '../../drizzle');
  try {
    const migrations = await loadMigrations(migrationDir);
    const handle = await createDb(resolveTarget(config.databaseUrl));
    try {
      const applied = await runMigrations(
        createMigrationStore(handle.db),
        migrations,
      );
      console.log(
        applied.length > 0
          ? `Migrasi diterapkan: ${applied.join(', ')}`
          : 'Tidak ada migrasi tertunda.',
      );
    } finally {
      await handle.close();
    }
  } catch (error) {
    console.error('Migrasi gagal:', error);
    process.exit(1);
  }
}

import { resolveDbTarget, type DbTarget } from './client';

function resolveTarget(databaseUrl: string | null): DbTarget {
  return resolveDbTarget(databaseUrl);
}
