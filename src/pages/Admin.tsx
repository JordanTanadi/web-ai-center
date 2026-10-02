/**
 * Dashboard admin (konsul PROGRESS 2 fase 3): login sederhana (1 akun) +
 * CRUD penuh dokumentasi & berita.
 *
 * - UI sengaja bahasa Indonesia tanpa i18n — alat internal, bukan halaman publik.
 * - Token hasil POST /api/admin/login disimpan di localStorage; semua aksi tulis
 *   membawa Authorization: Bearer; status 401 → otomatis keluar (token kedaluwarsa).
 * - Read memakai ambilDaftar (fallback [] bila backend mati), write memakai
 *   kirimJsonAdmin yang MELEMPAR ErrorApi — kegagalan wajib tampil ke operator.
 * - Slug dibuat server dari judul; saat edit slug dipegang tetap supaya tautan lama hidup.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { ambilDaftar, kirimJsonAdmin } from '../lib/api.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { DokumentasiItem } from '../data/dokumentasi.ts';

/** Kunci localStorage untuk token sesi admin. */
export const KEY_TOKEN_ADMIN = 'token-admin';

type Jenis = 'dokumentasi' | 'berita';
type ItemAdmin = DokumentasiItem | BeritaItem;

interface FieldDef {
  kunci: string;
  label: string;
  /** Tanda wajib di UI (server juga memvalidasi ulang). */
  wajib?: boolean;
  textarea?: boolean;
  baris?: number;
  /** Input bertipe date (format YYYY-MM-DD). */
  tanggal?: boolean;
}

/** Definisi form per jenis — urutan array = urutan render. */
const FIELD: Record<Jenis, FieldDef[]> = {
  dokumentasi: [
    { kunci: 'judul', label: 'Judul', wajib: true },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'kategori', label: 'Kategori', wajib: true },
    { kunci: 'gambar', label: 'Gambar (URL, opsional)' },
    { kunci: 'deskripsi', label: 'Deskripsi', wajib: true, textarea: true },
  ],
  berita: [
    { kunci: 'judul', label: 'Judul', wajib: true },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'penulis', label: 'Penulis', wajib: true },
    { kunci: 'gambar', label: 'Gambar (URL, opsional)' },
    { kunci: 'ringkasan', label: 'Ringkasan', wajib: true, textarea: true },
    { kunci: 'isi', label: 'Isi', wajib: true, textarea: true, baris: 8 },
  ],
};

interface Pesan {
  teks: string;
  sukses: boolean;
}

/** Form kosong — tanggal default hari ini (UTC) agar operator tinggal sesuaikan. */
function formKosong(): Record<string, string> {
  return {
    judul: '',
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: '',
    penulis: '',
    ringkasan: '',
    isi: '',
    gambar: '',
    deskripsi: '',
  };
}

/** Isi form dari item yang mau diedit (field asing jenis lain → string kosong). */
function formDariItem(item: ItemAdmin): Record<string, string> {
  return {
    judul: item.judul,
    tanggal: item.tanggal,
    gambar: item.gambar ?? '',
    kategori: 'kategori' in item ? item.kategori : '',
    deskripsi: 'deskripsi' in item ? item.deskripsi : '',
    ringkasan: 'ringkasan' in item ? item.ringkasan : '',
    isi: 'isi' in item ? item.isi : '',
    penulis: 'penulis' in item ? item.penulis : '',
  };
}

/** Susun body JSON hanya dari field milik jenis aktif. */
function bodyDariForm(form: Record<string, string>, jenis: Jenis): Record<string, string> {
  return Object.fromEntries(FIELD[jenis].map((f) => [f.kunci, form[f.kunci] ?? '']));
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(KEY_TOKEN_ADMIN),
  );
  const [jenis, setJenis] = useState<Jenis>('dokumentasi');
  const [daftar, setDaftar] = useState<ItemAdmin[]>([]);
  const [mode, setMode] = useState<'daftar' | 'tambah' | 'ubah'>('daftar');
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(formKosong);
  const [pesan, setPesan] = useState<Pesan | null>(null);
  const [password, setPassword] = useState('');

  /** Muat daftar sesuai jenis aktif (fallback [] bila backend mati). */
  async function muatDaftar(j: Jenis): Promise<void> {
    const items = await ambilDaftar<ItemAdmin>(`/${j}`, []);
    setDaftar(items);
  }

  useEffect(() => {
    if (token === null) {
      setDaftar([]);
      return;
    }
    void muatDaftar(jenis);
    // muatDaftar stabil (closure tanpa state); sengaja hanya bergantung token & jenis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, jenis]);

  function keluar(): void {
    localStorage.removeItem(KEY_TOKEN_ADMIN);
    setToken(null);
    setDaftar([]);
    setMode('daftar');
    setSlugEdit(null);
  }

  /** Tampilkan error aksi tulis; 401 = sesi kedaluwarsa → keluar otomatis. */
  function tanganiErrorAksi(error: unknown): void {
    const status = (error as { status?: number } | null)?.status;
    if (status === 401) {
      keluar();
      setPesan({ teks: 'Sesi berakhir — silakan masuk kembali.', sukses: false });
      return;
    }
    setPesan({
      teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
      sukses: false,
    });
  }

  async function masuk(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    try {
      const hasil = await kirimJsonAdmin<{ token: string }>('/admin/login', {
        method: 'POST',
        body: { password },
      });
      localStorage.setItem(KEY_TOKEN_ADMIN, hasil.token);
      setToken(hasil.token);
      setPassword('');
    } catch (error) {
      // Login gagal → tampilkan pesan server apa adanya (mis. "Password salah").
      setPesan({
        teks: error instanceof Error ? error.message : 'Gagal masuk',
        sukses: false,
      });
    }
  }

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (token === null || mode === 'daftar') return;
    setPesan(null);
    const ubah = mode === 'ubah' && slugEdit !== null;
    try {
      const hasil = await kirimJsonAdmin<ItemAdmin>(
        ubah ? `/${jenis}/${slugEdit}` : `/${jenis}`,
        { method: ubah ? 'PUT' : 'POST', body: bodyDariForm(form, jenis), token },
      );
      setPesan({
        teks: ubah
          ? `Konten "${hasil.judul}" diperbarui.`
          : `Konten "${hasil.judul}" tersimpan.`,
        sukses: true,
      });
      setMode('daftar');
      setSlugEdit(null);
      setForm(formKosong());
      await muatDaftar(jenis);
    } catch (error) {
      tanganiErrorAksi(error);
    }
  }

  async function hapus(item: ItemAdmin): Promise<void> {
    if (token === null) return;
    const yakin = window.confirm(`Hapus "${item.judul}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!yakin) return;
    setPesan(null);
    try {
      await kirimJsonAdmin(`/${jenis}/${item.slug}`, { method: 'DELETE', token });
      setPesan({ teks: `Konten "${item.judul}" dihapus.`, sukses: true });
      await muatDaftar(jenis);
    } catch (error) {
      tanganiErrorAksi(error);
    }
  }

  const elemenPesan =
    pesan === null ? null : (
      <p
        role={pesan.sukses ? 'status' : 'alert'}
        className={`mt-4 rounded-lg px-4 py-3 text-sm ${
          pesan.sukses ? 'bg-soft text-emerald-800' : 'bg-red-50 text-red-800'
        }`}
      >
        {pesan.teks}
      </p>
    );

  // — Layar login (belum ada token) ————————————————————————————————
  if (token === null) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl font-bold">Masuk Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Dashboard internal AI Center Ubaya — kelola dokumentasi & berita.
        </p>
        <form onSubmit={masuk} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            Masuk
          </button>
          {elemenPesan}
        </form>
        <p className="mt-8 text-sm">
          <a href="/beranda" className="underline">
            ← Kembali ke situs
          </a>
        </p>
      </main>
    );
  }

  // — Layar dashboard ————————————————————————————————————————————
  const labelJenis = jenis === 'dokumentasi' ? 'Dokumentasi' : 'Berita';
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-muted">Kelola konten dokumentasi & berita AI Center.</p>
        </div>
        <button
          type="button"
          onClick={keluar}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-soft"
        >
          Keluar
        </button>
      </header>

      <div role="tablist" aria-label="Jenis konten" className="mt-6 flex gap-2">
        {(['dokumentasi', 'berita'] as const).map((j) => (
          <button
            key={j}
            type="button"
            role="tab"
            aria-selected={jenis === j}
            onClick={() => {
              setJenis(j);
              setMode('daftar');
              setSlugEdit(null);
              setPesan(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              jenis === j ? 'bg-brand text-white' : 'border border-slate-300 hover:bg-soft'
            }`}
          >
            {j === 'dokumentasi' ? 'Dokumentasi' : 'Berita'}
          </button>
        ))}
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{labelJenis}</h2>
          {mode === 'daftar' && (
            <button
              type="button"
              onClick={() => {
                setForm(formKosong());
                setMode('tambah');
                setPesan(null);
              }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Tambah baru
            </button>
          )}
        </div>

        {elemenPesan}

        {mode === 'daftar' ? (
          daftar.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Belum ada konten {labelJenis}.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
              {daftar.map((item) => (
                <li key={item.slug} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.judul}</p>
                    <p className="text-xs text-muted">
                      {item.tanggal}
                      {'kategori' in item ? ` · ${item.kategori}` : ''}
                      {'penulis' in item ? ` · ${item.penulis}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(formDariItem(item));
                      setSlugEdit(item.slug);
                      setMode('ubah');
                      setPesan(null);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-soft"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => void hapus(item)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">
              {mode === 'ubah' ? `Ubah konten — ${slugEdit ?? ''}` : 'Tambah konten baru'}
            </h3>
            {FIELD[jenis].map((f) => (
              <div key={f.kunci}>
                <label htmlFor={`field-${f.kunci}`} className="block text-sm font-semibold">
                  {f.label}
                  {f.wajib === true ? ' *' : ''}
                </label>
                {f.textarea === true ? (
                  <textarea
                    id={`field-${f.kunci}`}
                    required={f.wajib === true}
                    rows={f.baris ?? 4}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={form[f.kunci] ?? ''}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [f.kunci]: event.target.value }))
                    }
                  />
                ) : (
                  <input
                    id={`field-${f.kunci}`}
                    type={f.tanggal === true ? 'date' : 'text'}
                    required={f.wajib === true}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={form[f.kunci] ?? ''}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [f.kunci]: event.target.value }))
                    }
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('daftar');
                  setSlugEdit(null);
                  setPesan(null);
                }}
                className="rounded-lg border border-slate-300 px-5 py-2 font-semibold hover:bg-soft"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </section>

      <p className="mt-10 text-sm">
        <a href="/beranda" className="underline">
          ← Kembali ke situs
        </a>
      </p>
    </main>
  );
}
