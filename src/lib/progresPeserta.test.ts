/**
 * Unit test sinkronisasi progres ke backend (src/lib/progresPeserta.ts):
 * pola ID peserta, baca (GET) dengan normalisasi, tulis (POST) fire-and-forget,
 * dan semua jalur kegagalan yang wajib diam-diam (tanpa lempar, tanpa log).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stateAwalBelajar } from './pembelajaran.ts';
import { ambilProgresBelajar, pesertaIdLokal, sinkronProgresBelajar } from './progresPeserta.ts';

/** Opsi yang membuka fetch di unit test (mode 'test' otomatis mematikan fetch). */
const OPSI = { baseUrl: 'http://api.test/api', mode: 'production' };

let fetchPalsu: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  fetchPalsu = vi.fn();
  vi.stubGlobal('fetch', fetchPalsu);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function respons(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('pesertaIdLokal', () => {
  it('dibuat sekali, sesuai pola 8-64 [A-Za-z0-9-], lalu identik antar panggilan', () => {
    const a = pesertaIdLokal();
    const b = pesertaIdLokal();
    expect(a).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    expect(b).toBe(a);
    expect(localStorage.getItem('ubaya-peserta-id')).toBe(a);
  });

  it('nilai tersimpan tidak sah → diganti id baru yang sah', () => {
    localStorage.setItem('ubaya-peserta-id', 'abc');
    const id = pesertaIdLokal();
    expect(id).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    expect(id).not.toBe('abc');
    expect(pesertaIdLokal()).toBe(id); // tersimpan lagi
  });
});

describe('ambilProgresBelajar (GET /api/progress)', () => {
  it('tanpa konfigurasi backend (mode test) → null & fetch TIDAK dipanggil', async () => {
    expect(await ambilProgresBelajar('r01', 4)).toBeNull();
    expect(fetchPalsu).not.toHaveBeenCalled();
  });

  it('respons berisi state → ternormalisasi; URL memakai kode uppercase + pesertaId', async () => {
    fetchPalsu.mockResolvedValue(
      respons(200, {
        items: [
          {
            kode: 'R01',
            state: { enrolled: true, completed: [true, false] },
            diperbaruiPada: '2026-10-15T08:00:00.000Z',
          },
        ],
      }),
    );
    const hasil = await ambilProgresBelajar('r01', 4, OPSI);
    expect(hasil).not.toBeNull();
    expect(hasil?.enrolled).toBe(true);
    expect(hasil?.completed).toEqual([true, false, false, false]); // dinormalisasi ke 4 modul

    const [url] = fetchPalsu.mock.calls[0] as [string];
    expect(url).toContain('/progress?pesertaId=');
    expect(url).toContain('kode=R01');
  });

  it('HTTP non-2xx / tanpa items / kode lain / fetch gagal → null diam-diam', async () => {
    fetchPalsu.mockResolvedValueOnce(respons(404, { error: 'x' }));
    expect(await ambilProgresBelajar('r01', 4, OPSI)).toBeNull();

    fetchPalsu.mockResolvedValueOnce(respons(200, { tanpaItems: true }));
    expect(await ambilProgresBelajar('r01', 4, OPSI)).toBeNull();

    fetchPalsu.mockResolvedValueOnce(
      respons(200, { items: [{ kode: 'ZZZ', state: { enrolled: true } }] }),
    );
    expect(await ambilProgresBelajar('r01', 4, OPSI)).toBeNull();

    fetchPalsu.mockRejectedValueOnce(new Error('jaringan putus'));
    expect(await ambilProgresBelajar('r01', 4, OPSI)).toBeNull();
  });
});

describe('sinkronProgresBelajar (POST /api/progress)', () => {
  it('mode test → false tanpa fetch (unit test deterministik, tanpa backend)', async () => {
    expect(await sinkronProgresBelajar('r01', stateAwalBelajar(4))).toBe(false);
    expect(fetchPalsu).not.toHaveBeenCalled();
  });

  it('POST body { pesertaId, kode uppercase, state } → true saat server 2xx', async () => {
    fetchPalsu.mockResolvedValue(respons(200, { kode: 'R01' }));
    const state = { ...stateAwalBelajar(4), enrolled: true };
    expect(await sinkronProgresBelajar('r01', state, OPSI)).toBe(true);

    const [url, init] = fetchPalsu.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/progress');
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as {
      pesertaId: string;
      kode: string;
      state: unknown;
    };
    expect(body.kode).toBe('R01');
    expect(body.pesertaId).toBe(pesertaIdLokal());
    expect(body.state).toEqual(state);
  });

  it('server menolak (400/429) atau jaringan putus → false, tanpa melempar', async () => {
    fetchPalsu.mockResolvedValueOnce(respons(429, { error: 'rate' }));
    expect(await sinkronProgresBelajar('r01', stateAwalBelajar(4), OPSI)).toBe(false);

    fetchPalsu.mockResolvedValueOnce(respons(400, { error: 'state' }));
    expect(await sinkronProgresBelajar('r01', stateAwalBelajar(4), OPSI)).toBe(false);

    fetchPalsu.mockRejectedValueOnce(new Error('putus'));
    expect(await sinkronProgresBelajar('r01', stateAwalBelajar(4), OPSI)).toBe(false);
  });
});
