import { describe, expect, test } from 'bun:test';
import { DEFAULT_PGDATA_DIR, resolveDbTarget } from './client';

describe('resolveDbTarget', () => {
  test('databaseUrl null → PGlite di folder default', () => {
    expect(resolveDbTarget(null)).toEqual({
      kind: 'pglite',
      dataDir: DEFAULT_PGDATA_DIR,
    });
    expect(DEFAULT_PGDATA_DIR.endsWith('.pglite')).toBe(true);
  });

  test('databaseUrl terisi → PostgreSQL asli', () => {
    const url = 'postgres://user:password@localhost:5432/ai_center';
    expect(resolveDbTarget(url)).toEqual({ kind: 'postgres', url });
  });

  test('edge: dataDir kustom dihormati', () => {
    expect(resolveDbTarget(null, 'D:/data/pg')).toEqual({
      kind: 'pglite',
      dataDir: 'D:/data/pg',
    });
  });
});
