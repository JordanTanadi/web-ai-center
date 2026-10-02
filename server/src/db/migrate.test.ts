import { describe, expect, test } from 'bun:test';
import {
  pickPendingMigrations,
  runMigrations,
  splitStatements,
  type MigrationFile,
  type MigrationStore,
} from './migrate';

describe('splitStatements', () => {
  test('memecah file drizzle-kit menjadi pernyataan individual', () => {
    const raw = [
      'CREATE TABLE "berita" ("id" serial);',
      '--> statement-breakpoint',
      'CREATE INDEX "berita_slug_idx" ON "berita" ("slug");',
      '--> statement-breakpoint',
      'CREATE UNIQUE INDEX "berita_slug_unique" ON "berita" ("slug");',
    ].join('\n');
    expect(splitStatements(raw)).toHaveLength(3);
    expect(splitStatements(raw)[0]).toContain('CREATE TABLE "berita"');
    expect(splitStatements(raw)[2]).toContain('CREATE UNIQUE INDEX');
  });

  test('edge: file kosong, hanya spasi, tanpa breakpoint, CRLF', () => {
    expect(splitStatements('')).toEqual([]);
    expect(splitStatements('   \n\t ')).toEqual([]);
    expect(splitStatements('SELECT 1;')).toEqual(['SELECT 1;']);
    expect(
      splitStatements('SELECT 1;\r\n--> statement-breakpoint\r\nSELECT 2;'),
    ).toEqual(['SELECT 1;', 'SELECT 2;']);
  });
});

describe('pickPendingMigrations', () => {
  const available = ['0000_init.sql', '0001_add_tim.sql', '0002_add_profil.sql'];

  test('belum ada yang dijalankan → semua, urut', () => {
    expect(pickPendingMigrations(available, [])).toEqual(available);
  });

  test('sebagian terjalankan → sisa yang belum saja', () => {
    expect(pickPendingMigrations(available, ['0000_init.sql'])).toEqual([
      '0001_add_tim.sql',
      '0002_add_profil.sql',
    ]);
  });

  test('edge: semua terjalankan → kosong', () => {
    expect(pickPendingMigrations(available, available)).toEqual([]);
  });
});

/** Fake store in-memory: mencatat urutan panggilan untuk asersi. */
function createFakeStore(initialApplied: string[] = []): {
  store: MigrationStore;
  calls: string[];
} {
  const applied = [...initialApplied];
  const calls: string[] = [];
  const store: MigrationStore = {
    async ensureTable() {
      calls.push('ensure');
    },
    async listApplied() {
      calls.push('list');
      return [...applied];
    },
    async markApplied(name) {
      calls.push(`applied:${name}`);
      applied.push(name);
    },
    async runStatement(statement) {
      calls.push(`stmt:${statement}`);
    },
  };
  return { store, calls };
}

describe('runMigrations', () => {
  const migrations: MigrationFile[] = [
    { name: '0000_init.sql', sql: 'CREATE TABLE a();\n--> statement-breakpoint\nCREATE TABLE b();' },
    { name: '0001_next.sql', sql: 'CREATE TABLE c();' },
  ];

  test('DB kosong → semua migrasi dijalankan berurutan lalu ditandai', async () => {
    const { store, calls } = createFakeStore();
    const applied = await runMigrations(store, migrations);
    expect(applied).toEqual(['0000_init.sql', '0001_next.sql']);
    expect(calls).toEqual([
      'ensure',
      'list',
      'stmt:CREATE TABLE a();',
      'stmt:CREATE TABLE b();',
      'applied:0000_init.sql',
      'stmt:CREATE TABLE c();',
      'applied:0001_next.sql',
    ]);
  });

  test('idempoten: yang sudah tercatat tidak dijalankan ulang', async () => {
    const { store, calls } = createFakeStore(['0000_init.sql']);
    const applied = await runMigrations(store, migrations);
    expect(applied).toEqual(['0001_next.sql']);
    expect(calls).toEqual([
      'ensure',
      'list',
      'stmt:CREATE TABLE c();',
      'applied:0001_next.sql',
    ]);
  });

  test('edge: file SQL kosong → tetap ditandai tanpa pernyataan', async () => {
    const { store, calls } = createFakeStore();
    const applied = await runMigrations(store, [{ name: 'empty.sql', sql: '  \n ' }]);
    expect(applied).toEqual(['empty.sql']);
    expect(calls).toEqual(['ensure', 'list', 'applied:empty.sql']);
  });
});
