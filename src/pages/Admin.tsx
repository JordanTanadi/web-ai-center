/**
 * Dashboard admin (konsul PROGRESS 2 fase 3 + lanjutan + Prioritas 2): login
 * sederhana (1 akun) + CRUD dokumentasi, berita, kursus — lalu tim & profil
 * (tab Prioritas 2; lihat komponen TimAdmin & ProfilAdmin), konten halaman
 * inference (tab Inference → InferenceAdmin, GET/PUT /api/inference), serta
 * testimoni & slide hero (tab Testimoni/Hero → TestimoniAdmin & HeroAdmin).
 *
 * - UI sengaja bahasa Indonesia tanpa i18n — alat internal, bukan halaman publik.
 * - Token hasil POST /api/admin/login disimpan di localStorage; semua aksi tulis
 *   membawa Authorization: Bearer; status 401 → otomatis keluar (token kedaluwarsa).
 * - Gambar berupa FILE (bukan URL): dipilih lewat input file, diunggah ke
 *   POST /api/admin/upload saat Simpan, URL hasilnya disimpan di kolom `gambar`.
 * - Read memakai ambilDaftar (fallback [] bila backend mati), write memakai
 *   kirimJsonAdmin/kirimFileAdmin yang MELEMPAR ErrorApi — kegagalan wajib tampil.
 * - Slug dibuat server dari judul; saat edit slug dipegang tetap supaya tautan lama hidup.
 *   Kursus memakai `kode` (mis. 'R01') sebagai kunci yang juga tidak boleh diganti saat edit.
 * - Batas panjang field (atribut `maks` → maxLength) disejajarkan dengan
 *   server/src/lib/tulis.ts — server tetap penegak utamanya (400 eksplisit).
 * - Tombol "Bersihkan gambar tidak terpakai" memanggil POST
 *   /api/admin/uploads/bersihkan (Prioritas 2) — menghapus file unggahan yang
 *   tidak dirujuk konten manapun.
 */
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ambilDaftar, ambilJson, kirimFileAdmin, kirimJsonAdmin } from '../lib/api.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { HeroSlide } from '../data/hero.ts';
import type { Kursus, Modul } from '../data/pelatihan.ts';
import type { KontenInference } from '../data/inference.ts';
import type { ProfilApi } from '../data/profil.ts';
import type { Testimoni } from '../data/testimoni.ts';
import type { AnggotaTim } from '../data/tim.ts';

/** Kunci localStorage untuk token sesi admin. */
export const KEY_TOKEN_ADMIN = 'token-admin';

type Jenis =
  | 'dokumentasi'
  | 'berita'
  | 'kursus'
  | 'tim'
  | 'profil'
  | 'inference'
  | 'testimoni'
  | 'hero';
/** Jenis yang memakai alur daftar+form generik di komponen utama (kursus/tim/
    profil/inference/testimoni/hero punya komponen admin sendiri karena bentuk
    datanya beda). */
type JenisDaftar = 'dokumentasi' | 'berita';
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
  /** Batas panjang karakter → atribut maxLength (sama dengan BATAS di server). */
  maks?: number;
}

/** Definisi form dokumentasi & berita — urutan array = urutan render. Kursus,
    tim, & profil punya form sendiri (KursusAdmin/TimAdmin/ProfilAdmin). */
const FIELD: Record<JenisDaftar, FieldDef[]> = {
  dokumentasi: [
    { kunci: 'judul', label: 'Judul', wajib: true, maks: 200 },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'kategori', label: 'Kategori', wajib: true, maks: 100 },
    { kunci: 'gambar', label: 'Gambar (file JPG/PNG/WebP, maks 2 MB)' },
    { kunci: 'deskripsi', label: 'Deskripsi', wajib: true, textarea: true, maks: 10000 },
  ],
  berita: [
    { kunci: 'judul', label: 'Judul', wajib: true, maks: 200 },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'penulis', label: 'Penulis', wajib: true, maks: 100 },
    { kunci: 'gambar', label: 'Gambar (file JPG/PNG/WebP, maks 2 MB)' },
    { kunci: 'ringkasan', label: 'Ringkasan', wajib: true, textarea: true, maks: 500 },
    { kunci: 'isi', label: 'Isi', wajib: true, textarea: true, baris: 8, maks: 20000 },
  ],
};

interface Pesan {
  teks: string;
  sukses: boolean;
}

/** Bentuk baris editor alur inference (tab Inference) — ↔ LangkahInference. */
type LangkahForm = { nomor: string; judul: string; deskripsi: string };
/** Bentuk baris editor contoh penerapan (tab Inference). */
type ContohForm = { slug: string; judul: string };

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
function bodyDariForm(form: Record<string, string>, jenis: JenisDaftar): Record<string, string> {
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
  /** File gambar baru (input file) + pratinjau lokalnya; null = tidak diganti. */
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [pesan, setPesan] = useState<Pesan | null>(null);
  const [password, setPassword] = useState('');

  /** Muat daftar sesuai jenis aktif (fallback [] bila backend mati). Kursus,
      tim, & profil dimuat komponennya sendiri (KursusAdmin/TimAdmin/ProfilAdmin). */
  async function muatDaftar(j: JenisDaftar): Promise<void> {
    const items = await ambilDaftar<ItemAdmin>(`/${j}`, []);
    setDaftar(items);
  }

  /** Ganti file gambar: simpan file + buat pratinjau lokal. */
  function pilihGambar(event: ChangeEvent<HTMLInputElement>): void {
    const dipilih = event.target.files?.[0] ?? null;
    bersihkanGambar();
    setFileGambar(dipilih);
    // jsdom (unit test) tidak punya createObjectURL — pratinjau hanya di browser.
    if (dipilih !== null && typeof URL.createObjectURL === 'function') {
      setPratinjau(URL.createObjectURL(dipilih));
    }
  }

  /** Bersihkan pilihan file + pratinjau (dipanggil tiap ganti mode/jenis/selesai simpan). */
  function bersihkanGambar(): void {
    setPratinjau((lama) => {
      if (lama !== null && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(lama);
      return null;
    });
    setFileGambar(null);
  }

  useEffect(() => {
    if (token === null) {
      setDaftar([]);
      return;
    }
    // Kursus/tim/profil memakai komponen admin sendiri (daftar milik section-nya).
    if (jenis !== 'dokumentasi' && jenis !== 'berita') {
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
    bersihkanGambar();
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
    if (token === null || mode === 'daftar' || (jenis !== 'dokumentasi' && jenis !== 'berita')) {
      return;
    }
    setPesan(null);
    const ubah = mode === 'ubah' && slugEdit !== null;
    try {
      // Gambar berupa file: unggah dulu, URL hasilnya masuk body.
      // Tanpa file baru → pertahankan nilai lama (URL lama / kosong).
      const body = bodyDariForm(form, jenis);
      if (fileGambar !== null) {
        const unggah = await kirimFileAdmin('/admin/upload', fileGambar, { token });
        body.gambar = unggah.url;
      }
      const hasil = await kirimJsonAdmin<ItemAdmin>(
        ubah ? `/${jenis}/${slugEdit}` : `/${jenis}`,
        { method: ubah ? 'PUT' : 'POST', body, token },
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
      bersihkanGambar();
      await muatDaftar(jenis);
    } catch (error) {
      tanganiErrorAksi(error);
    }
  }

  async function hapus(item: ItemAdmin): Promise<void> {
    if (token === null || (jenis !== 'dokumentasi' && jenis !== 'berita')) return;
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

  /**
   * Bersihkan file unggahan tidak terpakai (Prioritas 2): file gambar di
   * server yang tidak lagi dirujuk kolom manapun (sisa edit/hapus konten).
   */
  async function bersihkanGambarTidakTerpakai(): Promise<void> {
    if (token === null) return;
    const yakin = window.confirm(
      'Hapus file gambar di server yang tidak lagi dipakai konten manapun? Tindakan ini tidak bisa dibatalkan.',
    );
    if (!yakin) return;
    setPesan(null);
    try {
      const hasil = await kirimJsonAdmin<{ kering: boolean; items: string[] }>(
        '/admin/uploads/bersihkan',
        { method: 'POST', body: {}, token },
      );
      setPesan({
        teks:
          hasil.items.length === 0
            ? 'Semua gambar masih dipakai — tidak ada yang dibersihkan.'
            : `${hasil.items.length} gambar tidak terpakai dihapus.`,
        sukses: true,
      });
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
          Dashboard internal AI Center Ubaya — kelola dokumentasi, berita, kursus, tim, profil, inference, testimoni & slide hero.
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
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
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
  const LABEL_JENIS: Record<Jenis, string> = {
    dokumentasi: 'Dokumentasi',
    berita: 'Berita',
    kursus: 'Kursus',
    tim: 'Tim',
    profil: 'Profil',
    inference: 'Inference',
    testimoni: 'Testimoni',
    hero: 'Hero',
  };
  const labelJenis = LABEL_JENIS[jenis];
  /** Handler 401 bersama untuk section admin yang punya token sendiri. */
  const sesiBerakhir = (): void => {
    keluar();
    setPesan({ teks: 'Sesi berakhir — silakan masuk kembali.', sukses: false });
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola dokumentasi, berita, kursus, tim, profil, inference, testimoni & slide hero.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void bersihkanGambarTidakTerpakai()}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
          >
            Bersihkan gambar tidak terpakai
          </button>
          <button
            type="button"
            onClick={keluar}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
          >
            Keluar
          </button>
        </div>
      </header>

      <div role="tablist" aria-label="Jenis konten" className="mt-6 flex flex-wrap gap-2">
        {(
          [
            'dokumentasi',
            'berita',
            'kursus',
            'tim',
            'profil',
            'inference',
            'testimoni',
            'hero',
          ] as const
        ).map((j) => (
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
              bersihkanGambar();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              jenis === j ? 'bg-brand text-white' : 'border border-line hover:bg-soft'
            }`}
          >
            {LABEL_JENIS[j]}
          </button>
        ))}
      </div>

      {/* Satu titik render pesan aksi (simpan/hapus/bersih-bersih) — tab lain
          punya state pesan sendiri di komponennya masing-masing. */}
      {elemenPesan}

      {jenis === 'kursus' ? (
        <KursusAdmin token={token} gagal401={sesiBerakhir} />
      ) : jenis === 'tim' ? (
        <TimAdmin token={token} gagal401={sesiBerakhir} />
      ) : jenis === 'profil' ? (
        <ProfilAdmin token={token} gagal401={sesiBerakhir} />
      ) : jenis === 'inference' ? (
        <InferenceAdmin token={token} gagal401={sesiBerakhir} />
      ) : jenis === 'testimoni' ? (
        <TestimoniAdmin token={token} gagal401={sesiBerakhir} />
      ) : jenis === 'hero' ? (
        <HeroAdmin token={token} gagal401={sesiBerakhir} />
      ) : (
      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{labelJenis}</h2>
          {mode === 'daftar' && (
            <button
              type="button"
              onClick={() => {
                setForm(formKosong());
                bersihkanGambar();
                setMode('tambah');
                setPesan(null);
              }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Tambah baru
            </button>
          )}
        </div>

        {mode === 'daftar' ? (
          daftar.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Belum ada konten {labelJenis}.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
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
                      bersihkanGambar();
                      setSlugEdit(item.slug);
                      setMode('ubah');
                      setPesan(null);
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft"
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
          <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
            <h3 className="font-semibold">
              {mode === 'ubah' ? `Ubah konten — ${slugEdit ?? ''}` : 'Tambah konten baru'}
            </h3>
            {FIELD[jenis].map((f) => (
              <div key={f.kunci}>
                <label htmlFor={`field-${f.kunci}`} className="block text-sm font-semibold">
                  {f.label}
                  {f.wajib === true ? ' *' : ''}
                </label>
                {f.kunci === 'gambar' ? (
                  // Gambar berupa FILE (bukan URL): diunggah ke server saat Simpan.
                  <div>
                    <input
                      id="field-gambar"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={pilihGambar}
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-muted">
                      {form.gambar !== ''
                        ? 'Gambar lama dipertahankan bila tidak memilih file baru.'
                        : 'Belum ada gambar — kartu memakai panel pengganti bermerek.'}
                    </p>
                    {pratinjau !== null && (
                      <img
                        src={pratinjau}
                        alt="Pratinjau gambar baru"
                        className="mt-2 aspect-video w-full max-w-xs rounded-lg border border-line bg-soft object-cover"
                      />
                    )}
                  </div>
                ) : f.textarea === true ? (
                  <textarea
                    id={`field-${f.kunci}`}
                    required={f.wajib === true}
                    rows={f.baris ?? 4}
                    maxLength={f.maks}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2"
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
                    maxLength={f.maks}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2"
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
                  bersihkanGambar();
                }}
                className="rounded-lg border border-line px-5 py-2 font-semibold hover:bg-soft"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </section>
      )}

      <p className="mt-10 text-sm">
        <a href="/beranda" className="underline">
          ← Kembali ke situs
        </a>
      </p>
    </main>
  );
}

/** Pecah textarea menjadi daftar baris (satu item per baris). */
function barisDaftar(teks: string): string[] {
  return teks
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b !== '');
}

const MODUL_KOSONG: Modul = { judul: '', deskripsi: '', meta: '' };

/** Section CRUD kursus + editor daftar modul (tab "Kursus" di dashboard). */
function KursusAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [daftar, setDaftar] = useState<Kursus[]>([]);
  const [mode, setMode] = useState<'daftar' | 'tambah' | 'ubah'>('daftar');
  const [kodeEdit, setKodeEdit] = useState<string | null>(null);
  const [k, setK] = useState({
    kode: '',
    judul: '',
    deskripsi: '',
    tentang: '',
    durasi: '',
    level: '',
    format: '',
    instruktur: '',
    peran: '',
    inisial: '',
  });
  const [targetText, setTargetText] = useState('');
  const [hasilText, setHasilText] = useState('');
  const [modul, setModul] = useState<Modul[]>([{ ...MODUL_KOSONG }]);
  const [pesan, setPesan] = useState<Pesan | null>(null);

  async function muat(): Promise<void> {
    setDaftar(await ambilDaftar<Kursus>('/kursus', []));
  }

  useEffect(() => {
    void muat();
    // Sekali saat tab dibuka (daftar milik section ini sendiri).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function atur(kunci: keyof typeof k, nilai: string): void {
    setK((prev) => ({ ...prev, [kunci]: nilai }));
  }

  function aturModul(index: number, kunci: keyof Modul, nilai: string): void {
    setModul((prev) => prev.map((m, i) => (i === index ? { ...m, [kunci]: nilai } : m)));
  }

  function mulaiTambah(): void {
    setK({ kode: '', judul: '', deskripsi: '', tentang: '', durasi: '', level: '', format: '', instruktur: '', peran: '', inisial: '' });
    setTargetText('');
    setHasilText('');
    setModul([{ ...MODUL_KOSONG }]);
    setKodeEdit(null);
    setMode('tambah');
    setPesan(null);
  }

  function mulaiUbah(item: Kursus): void {
    setK({
      kode: item.kode,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tentang: item.tentang,
      durasi: item.durasi,
      level: item.level,
      format: item.format,
      instruktur: item.instruktur,
      peran: item.peran,
      inisial: item.inisial,
    });
    setTargetText(item.target.join('\n'));
    setHasilText(item.hasil.join('\n'));
    setModul(item.modul.length > 0 ? item.modul.map((m) => ({ ...m })) : [{ ...MODUL_KOSONG }]);
    setKodeEdit(item.kode);
    setMode('ubah');
    setPesan(null);
  }

  function tanganiError(error: unknown): void {
    if ((error as { status?: number } | null)?.status === 401) {
      gagal401();
      return;
    }
    setPesan({
      teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
      sukses: false,
    });
  }

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (mode === 'daftar') return;
    setPesan(null);
    const ubah = mode === 'ubah' && kodeEdit !== null;
    const kode = ubah ? kodeEdit : k.kode;
    const body = {
      kode,
      judul: k.judul,
      deskripsi: k.deskripsi,
      tentang: k.tentang,
      durasi: k.durasi,
      level: k.level,
      format: k.format,
      instruktur: k.instruktur,
      peran: k.peran,
      inisial: k.inisial,
      target: barisDaftar(targetText),
      hasil: barisDaftar(hasilText),
      // Baris modul yang ketiga kolomnya kosong diabaikan (sisa divalidasi server).
      modul: modul
        .map((m) => ({ judul: m.judul.trim(), deskripsi: m.deskripsi.trim(), meta: m.meta.trim() }))
        .filter((m) => m.judul !== '' || m.deskripsi !== '' || m.meta !== ''),
    };
    try {
      const hasil = await kirimJsonAdmin<Kursus>(ubah ? `/kursus/${kodeEdit}` : '/kursus', {
        method: ubah ? 'PUT' : 'POST',
        body,
        token,
      });
      setPesan({
        teks: ubah ? `Kursus "${hasil.judul}" diperbarui.` : `Kursus "${hasil.judul}" tersimpan.`,
        sukses: true,
      });
      setMode('daftar');
      setKodeEdit(null);
      await muat();
    } catch (error) {
      tanganiError(error);
    }
  }

  async function hapus(item: Kursus): Promise<void> {
    const yakin = window.confirm(`Hapus kursus "${item.judul}" (${item.kode})? Tindakan ini tidak bisa dibatalkan.`);
    if (!yakin) return;
    setPesan(null);
    try {
      await kirimJsonAdmin(`/kursus/${item.kode}`, { method: 'DELETE', token });
      setPesan({ teks: `Kursus "${item.judul}" dihapus.`, sukses: true });
      await muat();
    } catch (error) {
      tanganiError(error);
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';
  // maks = batas panjang server (lib/tulis BATAS) → atribut maxLength.
  const teksSingkat: Array<{ kunci: keyof typeof k; label: string; maks: number }> = [
    { kunci: 'judul', label: 'Judul', maks: 200 },
    { kunci: 'durasi', label: 'Durasi (mis. 4 sesi)', maks: 100 },
    { kunci: 'level', label: 'Level (mis. Pemula)', maks: 100 },
    { kunci: 'format', label: 'Format (mis. Online)', maks: 100 },
    { kunci: 'instruktur', label: 'Instruktur', maks: 200 },
    { kunci: 'peran', label: 'Peran instruktur', maks: 200 },
    { kunci: 'inisial', label: 'Inisial avatar', maks: 10 },
  ];

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Kursus</h2>
        {mode === 'daftar' && (
          <button
            type="button"
            onClick={mulaiTambah}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Tambah baru
          </button>
        )}
      </div>

      {elemenPesan}

      {mode === 'daftar' ? (
        daftar.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada konten Kursus.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {daftar.map((item) => (
              <li key={item.kode} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.judul}</p>
                  <p className="text-xs text-muted">
                    {item.kode} · {item.durasi} · {item.level} · {item.modul.length} modul
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => mulaiUbah(item)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft"
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
        <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
          <h3 className="font-semibold">
            {mode === 'ubah' ? `Ubah kursus — ${kodeEdit ?? ''}` : 'Tambah kursus baru'}
          </h3>
          <div>
            <label htmlFor="kursus-kode" className={labelCls}>
              Kode (mis. R01) *
            </label>
            <input
              id="kursus-kode"
              type="text"
              required
              maxLength={12}
              disabled={mode === 'ubah'}
              placeholder="R01"
              className={`${inputCls} disabled:bg-soft`}
              value={mode === 'ubah' ? (kodeEdit ?? '') : k.kode}
              onChange={(event) => atur('kode', event.target.value)}
            />
            {mode === 'ubah' && (
              <p className="mt-1 text-xs text-muted">Kode kunci tidak bisa diganti saat edit.</p>
            )}
          </div>
          {teksSingkat.map((f) => (
            <div key={f.kunci}>
              <label htmlFor={`kursus-${f.kunci}`} className={labelCls}>
                {f.label} *
              </label>
              <input
                id={`kursus-${f.kunci}`}
                type="text"
                required
                maxLength={f.maks}
                className={inputCls}
                value={k[f.kunci]}
                onChange={(event) => atur(f.kunci, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label htmlFor="kursus-deskripsi" className={labelCls}>
              Deskripsi singkat *
            </label>
            <textarea
              id="kursus-deskripsi"
              required
              rows={3}
              maxLength={1000}
              className={inputCls}
              value={k.deskripsi}
              onChange={(event) => atur('deskripsi', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kursus-tentang" className={labelCls}>
              Tentang kursus (panjang) *
            </label>
            <textarea
              id="kursus-tentang"
              required
              rows={4}
              maxLength={20000}
              className={inputCls}
              value={k.tentang}
              onChange={(event) => atur('tentang', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kursus-target" className={labelCls}>
              Target peserta (satu per baris) *
            </label>
            <textarea
              id="kursus-target"
              required
              rows={3}
              placeholder={'Mahasiswa\nDosen'}
              className={inputCls}
              value={targetText}
              onChange={(event) => setTargetText(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kursus-hasil" className={labelCls}>
              Hasil belajar (satu per baris) *
            </label>
            <textarea
              id="kursus-hasil"
              required
              rows={3}
              className={inputCls}
              value={hasilText}
              onChange={(event) => setHasilText(event.target.value)}
            />
          </div>
          <div>
            <p className={labelCls}>Daftar modul *</p>
            <ol className="mt-2 space-y-3">
              {modul.map((m, i) => (
                <li key={i} className="rounded-lg border border-line p-3">
                  <p className="text-xs font-bold text-muted">Modul {i + 1}</p>
                  <input
                    type="text"
                    required
                    aria-label={`Judul modul ${i + 1}`}
                    placeholder="Judul modul"
                    maxLength={200}
                    className={`${inputCls} mt-2`}
                    value={m.judul}
                    onChange={(event) => aturModul(i, 'judul', event.target.value)}
                  />
                  <input
                    type="text"
                    required
                    aria-label={`Meta modul ${i + 1}`}
                    placeholder="Meta (mis. 4 video · 35 menit)"
                    maxLength={200}
                    className={inputCls}
                    value={m.meta}
                    onChange={(event) => aturModul(i, 'meta', event.target.value)}
                  />
                  <textarea
                    required
                    aria-label={`Deskripsi modul ${i + 1}`}
                    placeholder="Deskripsi modul"
                    rows={2}
                    maxLength={1000}
                    className={inputCls}
                    value={m.deskripsi}
                    onChange={(event) => aturModul(i, 'deskripsi', event.target.value)}
                  />
                  {modul.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setModul((prev) => prev.filter((_, j) => j !== i))}
                      className="mt-2 text-sm font-semibold text-red-700 hover:underline"
                    >
                      Hapus modul ini
                    </button>
                  )}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setModul((prev) => [...prev, { ...MODUL_KOSONG }])}
              className="mt-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
            >
              + Tambah modul
            </button>
          </div>
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
                setKodeEdit(null);
                setPesan(null);
              }}
              className="rounded-lg border border-line px-5 py-2 font-semibold hover:bg-soft"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/**
 * Section CRUD anggota tim (tab "Tim", Prioritas 2). Kunci baris = `id` dari
 * backend (GET /api/tim mengembalikan id & urutan); foto diperlakukan seperti
 * gambar lain — file diunggah saat Simpan, URL hasilnya masuk ke body.
 */
function TimAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [daftar, setDaftar] = useState<AnggotaTim[]>([]);
  const [mode, setMode] = useState<'daftar' | 'tambah' | 'ubah'>('daftar');
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [f, setF] = useState({ nama: '', peran: '', kredensial: '', foto: '', urutan: '0' });
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [pesan, setPesan] = useState<{ teks: string; sukses: boolean } | null>(null);

  async function muat(): Promise<void> {
    setDaftar(await ambilDaftar<AnggotaTim>('/tim', []));
  }

  useEffect(() => {
    void muat();
    // muatDaftar stabil (closure tanpa state); muat sekali saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tanganiError(error: unknown): void {
    if ((error as { status?: number } | null)?.status === 401) {
      gagal401();
      return;
    }
    setPesan({
      teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
      sukses: false,
    });
  }

  /** URL object untuk pratinjau file baru di-revoke saat berganti/batal. */
  function lepasPratinjau(): void {
    if (pratinjau !== null && pratinjau.startsWith('blob:')) URL.revokeObjectURL(pratinjau);
  }

  function mulaiTambah(): void {
    setF({ nama: '', peran: '', kredensial: '', foto: '', urutan: String(daftar.length) });
    setFileFoto(null);
    setPratinjau(null);
    setMode('tambah');
    setPesan(null);
  }

  function mulaiUbah(item: AnggotaTim): void {
    if (item.id === undefined) return;
    setF({
      nama: item.nama,
      peran: item.peran,
      kredensial: item.kredensial ?? '',
      foto: item.foto ?? '',
      urutan: String(item.urutan ?? 0),
    });
    setFileFoto(null);
    setPratinjau(null);
    setIdEdit(item.id);
    setMode('ubah');
    setPesan(null);
  }

  function pilihFoto(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    lepasPratinjau();
    setFileFoto(file);
    setPratinjau(file !== null ? URL.createObjectURL(file) : null);
  }

  function batalkan(): void {
    lepasPratinjau();
    setMode('daftar');
    setIdEdit(null);
    setFileFoto(null);
    setPratinjau(null);
    setPesan(null);
  }

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    try {
      let foto = f.foto;
      if (fileFoto !== null) {
        const unggah = await kirimFileAdmin('/admin/upload', fileFoto, { token });
        foto = unggah.url;
      }
      const body = {
        nama: f.nama,
        peran: f.peran,
        kredensial: f.kredensial,
        foto,
        urutan: Number(f.urutan),
      };
      const ubah = mode === 'ubah' && idEdit !== null;
      const hasil = await kirimJsonAdmin<AnggotaTim>(ubah ? `/tim/${idEdit}` : '/tim', {
        method: ubah ? 'PUT' : 'POST',
        body,
        token,
      });
      setPesan({
        teks: ubah ? `Anggota "${hasil.nama}" diperbarui.` : `Anggota "${hasil.nama}" tersimpan.`,
        sukses: true,
      });
      setMode('daftar');
      setIdEdit(null);
      setFileFoto(null);
      lepasPratinjau();
      setPratinjau(null);
      await muat();
    } catch (error) {
      tanganiError(error);
    }
  }

  async function hapus(item: AnggotaTim): Promise<void> {
    if (item.id === undefined) return;
    const yakin = window.confirm(
      `Hapus "${item.nama}" dari tim? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!yakin) return;
    setPesan(null);
    try {
      await kirimJsonAdmin(`/tim/${item.id}`, { method: 'DELETE', token });
      setPesan({ teks: `Anggota "${item.nama}" dihapus.`, sukses: true });
      await muat();
    } catch (error) {
      tanganiError(error);
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Tim</h2>
        {mode === 'daftar' && (
          <button
            type="button"
            onClick={mulaiTambah}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Tambah baru
          </button>
        )}
      </div>

      {elemenPesan}

      {mode === 'daftar' ? (
        daftar.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada anggota Tim.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {daftar.map((item, i) => (
              <li key={item.id ?? i} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.nama}</p>
                  <p className="text-xs text-muted">
                    {item.peran}
                    {item.kredensial !== undefined ? ` · ${item.kredensial}` : ''} · urutan{' '}
                    {item.urutan ?? '-'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => mulaiUbah(item)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft"
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
        <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
          <h3 className="font-semibold">
            {mode === 'ubah' ? `Ubah anggota — ${f.nama}` : 'Tambah anggota baru'}
          </h3>
          <div>
            <label htmlFor="tim-nama" className={labelCls}>
              Nama *
            </label>
            <input
              id="tim-nama"
              type="text"
              required
              maxLength={200}
              className={inputCls}
              value={f.nama}
              onChange={(event) => setF((prev) => ({ ...prev, nama: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="tim-peran" className={labelCls}>
              Peran *
            </label>
            <input
              id="tim-peran"
              type="text"
              required
              maxLength={200}
              className={inputCls}
              value={f.peran}
              onChange={(event) => setF((prev) => ({ ...prev, peran: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="tim-kredensial" className={labelCls}>
              Kredensial (opsional)
            </label>
            <input
              id="tim-kredensial"
              type="text"
              maxLength={300}
              className={inputCls}
              value={f.kredensial}
              onChange={(event) => setF((prev) => ({ ...prev, kredensial: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="tim-urutan" className={labelCls}>
              Urutan tampil (0 = paling atas) *
            </label>
            <input
              id="tim-urutan"
              type="number"
              required
              min={0}
              max={9999}
              className={inputCls}
              value={f.urutan}
              onChange={(event) => setF((prev) => ({ ...prev, urutan: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="tim-foto" className={labelCls}>
              Foto (file JPG/PNG/WebP, maks 2 MB)
            </label>
            <input
              id="tim-foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block text-sm"
              onChange={pilihFoto}
            />
            {pratinjau !== null && (
              <img
                src={pratinjau}
                alt="Pratinjau foto anggota"
                className="mt-2 h-24 w-24 rounded-full object-cover"
              />
            )}
            {mode === 'ubah' && f.foto !== '' && fileFoto === null && pratinjau === null && (
              <p className="mt-1 text-xs text-muted">
                Foto saat ini: {f.foto} — pilih file baru untuk mengganti.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={batalkan}
              className="rounded-lg border border-line px-5 py-2 font-semibold hover:bg-soft"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/**
 * Section CRUD testimoni (tab "Testimoni" — lengkapi CRUD admin, pola sama
 * dengan TimAdmin). Kunci baris = `id` dari backend; GET /api/testimoni
 * mengembalikan `id` & `urutan` (data dummy tidak memilikinya).
 */
function TestimoniAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [daftar, setDaftar] = useState<Testimoni[]>([]);
  const [mode, setMode] = useState<'daftar' | 'tambah' | 'ubah'>('daftar');
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [f, setF] = useState({ nama: '', peran: '', kutipan: '', urutan: '0' });
  const [pesan, setPesan] = useState<{ teks: string; sukses: boolean } | null>(null);

  async function muat(): Promise<void> {
    setDaftar(await ambilDaftar<Testimoni>('/testimoni', []));
  }

  useEffect(() => {
    void muat();
    // muat stabil (closure tanpa state); muat sekali saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tanganiError(error: unknown): void {
    if ((error as { status?: number } | null)?.status === 401) {
      gagal401();
      return;
    }
    setPesan({
      teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
      sukses: false,
    });
  }

  function mulaiTambah(): void {
    setF({ nama: '', peran: '', kutipan: '', urutan: String(daftar.length) });
    setMode('tambah');
    setPesan(null);
  }

  function mulaiUbah(item: Testimoni): void {
    if (item.id === undefined) return;
    setF({
      nama: item.nama,
      peran: item.peran,
      kutipan: item.kutipan,
      urutan: String(item.urutan ?? 0),
    });
    setIdEdit(item.id);
    setMode('ubah');
    setPesan(null);
  }

  function batalkan(): void {
    setMode('daftar');
    setIdEdit(null);
    setPesan(null);
  }

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    try {
      const body = {
        nama: f.nama,
        peran: f.peran,
        kutipan: f.kutipan,
        urutan: Number(f.urutan),
      };
      const ubah = mode === 'ubah' && idEdit !== null;
      const hasil = await kirimJsonAdmin<Testimoni>(ubah ? `/testimoni/${idEdit}` : '/testimoni', {
        method: ubah ? 'PUT' : 'POST',
        body,
        token,
      });
      setPesan({
        teks: ubah
          ? `Testimoni "${hasil.nama}" diperbarui.`
          : `Testimoni "${hasil.nama}" tersimpan.`,
        sukses: true,
      });
      setMode('daftar');
      setIdEdit(null);
      await muat();
    } catch (error) {
      tanganiError(error);
    }
  }

  async function hapus(item: Testimoni): Promise<void> {
    if (item.id === undefined) return;
    const yakin = window.confirm(
      `Hapus testimoni "${item.nama}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!yakin) return;
    setPesan(null);
    try {
      await kirimJsonAdmin(`/testimoni/${item.id}`, { method: 'DELETE', token });
      setPesan({ teks: `Testimoni "${item.nama}" dihapus.`, sukses: true });
      await muat();
    } catch (error) {
      tanganiError(error);
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Testimoni</h2>
        {mode === 'daftar' && (
          <button
            type="button"
            onClick={mulaiTambah}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Tambah baru
          </button>
        )}
      </div>

      {elemenPesan}

      {mode === 'daftar' ? (
        daftar.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada testimoni.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {daftar.map((item, i) => (
              <li key={item.id ?? i} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.nama}</p>
                  <p className="text-xs text-muted">
                    {item.peran} · urutan {item.urutan ?? '-'}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{item.kutipan}</p>
                </div>
                <button
                  type="button"
                  onClick={() => mulaiUbah(item)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft"
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
        <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
          <h3 className="font-semibold">
            {mode === 'ubah' ? `Ubah testimoni — ${f.nama}` : 'Tambah testimoni baru'}
          </h3>
          <div>
            <label htmlFor="testimoni-nama" className={labelCls}>
              Nama *
            </label>
            <input
              id="testimoni-nama"
              type="text"
              required
              maxLength={200}
              className={inputCls}
              value={f.nama}
              onChange={(event) => setF((prev) => ({ ...prev, nama: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="testimoni-peran" className={labelCls}>
              Peran (mis. Mahasiswa) *
            </label>
            <input
              id="testimoni-peran"
              type="text"
              required
              maxLength={200}
              className={inputCls}
              value={f.peran}
              onChange={(event) => setF((prev) => ({ ...prev, peran: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="testimoni-kutipan" className={labelCls}>
              Kutipan *
            </label>
            <textarea
              id="testimoni-kutipan"
              required
              rows={3}
              maxLength={1000}
              className={inputCls}
              value={f.kutipan}
              onChange={(event) => setF((prev) => ({ ...prev, kutipan: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="testimoni-urutan" className={labelCls}>
              Urutan tampil (0 = paling atas) *
            </label>
            <input
              id="testimoni-urutan"
              type="number"
              required
              min={0}
              max={9999}
              className={inputCls}
              value={f.urutan}
              onChange={(event) => setF((prev) => ({ ...prev, urutan: event.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={batalkan}
              className="rounded-lg border border-line px-5 py-2 font-semibold hover:bg-soft"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/**
 * Section CRUD slide hero (tab "Hero" — lengkapi CRUD admin). Kunci baris =
 * `id` dari backend. Gambar diperlakukan seperti tab lain (file diunggah saat
 * Simpan); BILA file baru dipilih, `srcSet` ikut dikosongkan — kalau tidak,
 * browser tetap memakai varian lama sehingga gambar baru tidak pernah tampil.
 * Slide terakhir tidak bisa dihapus dari UI (hero beranda jadi kosong).
 */
function HeroAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [daftar, setDaftar] = useState<HeroSlide[]>([]);
  const [mode, setMode] = useState<'daftar' | 'tambah' | 'ubah'>('daftar');
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [f, setF] = useState({
    urutan: '0',
    eyebrow: '',
    judul: '',
    judulAksen: '',
    sub: '',
    badgeJudul: '',
    badgeSub: '',
    ctaPrimerLabel: '',
    ctaPrimerTo: '',
    ctaSekunderLabel: '',
    ctaSekunderTo: '',
    image: '',
    srcSet: '',
    sizes: '',
    layout: '',
  });
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [pesan, setPesan] = useState<{ teks: string; sukses: boolean } | null>(null);

  async function muat(): Promise<void> {
    setDaftar(await ambilDaftar<HeroSlide>('/hero-slides', []));
  }

  useEffect(() => {
    void muat();
    // muat stabil (closure tanpa state); muat sekali saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tanganiError(error: unknown): void {
    if ((error as { status?: number } | null)?.status === 401) {
      gagal401();
      return;
    }
    setPesan({
      teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
      sukses: false,
    });
  }

  /** URL object untuk pratinjau file baru di-revoke saat berganti/batal. */
  function lepasPratinjau(): void {
    if (pratinjau !== null && pratinjau.startsWith('blob:')) URL.revokeObjectURL(pratinjau);
  }

  function mulaiTambah(): void {
    setF({
      urutan: String(daftar.length),
      eyebrow: '',
      judul: '',
      judulAksen: '',
      sub: '',
      badgeJudul: '',
      badgeSub: '',
      ctaPrimerLabel: '',
      ctaPrimerTo: '',
      ctaSekunderLabel: '',
      ctaSekunderTo: '',
      image: '',
      srcSet: '',
      sizes: '',
      layout: '',
    });
    setFileGambar(null);
    setPratinjau(null);
    setMode('tambah');
    setPesan(null);
  }

  function mulaiUbah(item: HeroSlide): void {
    if (item.id === undefined) return;
    setF({
      urutan: String(item.urutan ?? 0),
      eyebrow: item.eyebrow,
      judul: item.judul,
      judulAksen: item.judulAksen,
      sub: item.sub,
      badgeJudul: item.badgeJudul,
      badgeSub: item.badgeSub,
      ctaPrimerLabel: item.ctaPrimer.label,
      ctaPrimerTo: item.ctaPrimer.to,
      ctaSekunderLabel: item.ctaSekunder.label,
      ctaSekunderTo: item.ctaSekunder.to,
      image: item.image ?? '',
      srcSet: item.srcSet ?? '',
      sizes: item.sizes ?? '',
      layout: item.layout ?? '',
    });
    setFileGambar(null);
    setPratinjau(null);
    setIdEdit(item.id);
    setMode('ubah');
    setPesan(null);
  }

  function pilihGambar(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    lepasPratinjau();
    setFileGambar(file);
    // jsdom (unit test) tidak punya createObjectURL — pratinjau hanya di browser.
    setPratinjau(file !== null && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null);
    // File baru = varian srcSet lama tidak relevan (bahkan menunjuk file lain)
    // → kosongkan supaya slide tampil memakai file yang baru dipilih.
    if (file !== null) setF((prev) => ({ ...prev, srcSet: '' }));
  }

  function batalkan(): void {
    lepasPratinjau();
    setMode('daftar');
    setIdEdit(null);
    setFileGambar(null);
    setPratinjau(null);
    setPesan(null);
  }

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    try {
      let image = f.image;
      if (fileGambar !== null) {
        const unggah = await kirimFileAdmin('/admin/upload', fileGambar, { token });
        image = unggah.url;
      }
      const body = {
        urutan: Number(f.urutan),
        eyebrow: f.eyebrow,
        judul: f.judul,
        judulAksen: f.judulAksen,
        sub: f.sub,
        badgeJudul: f.badgeJudul,
        badgeSub: f.badgeSub,
        ctaPrimer: { label: f.ctaPrimerLabel, to: f.ctaPrimerTo },
        ctaSekunder: { label: f.ctaSekunderLabel, to: f.ctaSekunderTo },
        image,
        srcSet: f.srcSet,
        sizes: f.sizes,
        // layout kosong = default; server menyimpan NULL (bukan 'default').
        layout: f.layout === '' ? null : f.layout,
      };
      const ubah = mode === 'ubah' && idEdit !== null;
      const hasil = await kirimJsonAdmin<HeroSlide>(
        ubah ? `/hero-slides/${idEdit}` : '/hero-slides',
        { method: ubah ? 'PUT' : 'POST', body, token },
      );
      setPesan({
        teks: ubah
          ? `Slide "${hasil.judul}" diperbarui.`
          : `Slide "${hasil.judul}" tersimpan.`,
        sukses: true,
      });
      setMode('daftar');
      setIdEdit(null);
      setFileGambar(null);
      lepasPratinjau();
      setPratinjau(null);
      await muat();
    } catch (error) {
      tanganiError(error);
    }
  }

  async function hapus(item: HeroSlide): Promise<void> {
    if (item.id === undefined) return;
    const yakin = window.confirm(
      `Hapus slide "${item.judul}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!yakin) return;
    setPesan(null);
    try {
      await kirimJsonAdmin(`/hero-slides/${item.id}`, { method: 'DELETE', token });
      setPesan({ teks: `Slide "${item.judul}" dihapus.`, sukses: true });
      await muat();
    } catch (error) {
      tanganiError(error);
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Hero</h2>
        {mode === 'daftar' && (
          <button
            type="button"
            onClick={mulaiTambah}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Tambah baru
          </button>
        )}
      </div>

      {elemenPesan}

      {mode === 'daftar' ? (
        daftar.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada slide hero.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {daftar.map((item, i) => (
              <li key={item.id ?? i} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {item.judul} {item.judulAksen}
                  </p>
                  <p className="text-xs text-muted">
                    urutan {item.urutan ?? '-'} · layout {item.layout ?? 'default'} ·{' '}
                    {item.image !== undefined ? item.image : 'tanpa gambar'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => mulaiUbah(item)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  disabled={daftar.length <= 1}
                  title={
                    daftar.length <= 1
                      ? 'Minimal harus ada 1 slide — hero beranda jadi kosong bila dihapus.'
                      : undefined
                  }
                  onClick={() => void hapus(item)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
          <h3 className="font-semibold">
            {mode === 'ubah' ? `Ubah slide — ${f.judul}` : 'Tambah slide hero baru'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hero-urutan" className={labelCls}>
                Urutan tampil (0 = pertama) *
              </label>
              <input
                id="hero-urutan"
                type="number"
                required
                min={0}
                max={9999}
                className={inputCls}
                value={f.urutan}
                onChange={(event) => setF((prev) => ({ ...prev, urutan: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="hero-layout" className={labelCls}>
                Layout
              </label>
              <select
                id="hero-layout"
                className={inputCls}
                value={f.layout}
                onChange={(event) => setF((prev) => ({ ...prev, layout: event.target.value }))}
              >
                <option value="">default — teks kiri, background overlay</option>
                <option value="image-left">image-left — gambar kiri, teks kanan</option>
                <option value="teks-kanan">teks-kanan — teks di samping kanan</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="hero-eyebrow" className={labelCls}>
              Eyebrow (teks kecil di atas judul) *
            </label>
            <input
              id="hero-eyebrow"
              type="text"
              required
              maxLength={150}
              className={inputCls}
              value={f.eyebrow}
              onChange={(event) => setF((prev) => ({ ...prev, eyebrow: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hero-judul" className={labelCls}>
                Judul *
              </label>
              <input
                id="hero-judul"
                type="text"
                required
                maxLength={150}
                className={inputCls}
                value={f.judul}
                onChange={(event) => setF((prev) => ({ ...prev, judul: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="hero-judul-aksen" className={labelCls}>
                Aksen judul (bagian terakhir) *
              </label>
              <input
                id="hero-judul-aksen"
                type="text"
                required
                maxLength={150}
                className={inputCls}
                value={f.judulAksen}
                onChange={(event) => setF((prev) => ({ ...prev, judulAksen: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="hero-sub" className={labelCls}>
              Subjudul *
            </label>
            <textarea
              id="hero-sub"
              required
              rows={3}
              maxLength={400}
              className={inputCls}
              value={f.sub}
              onChange={(event) => setF((prev) => ({ ...prev, sub: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hero-cta-primer-label" className={labelCls}>
                CTA utama — label *
              </label>
              <input
                id="hero-cta-primer-label"
                type="text"
                required
                maxLength={150}
                className={inputCls}
                value={f.ctaPrimerLabel}
                onChange={(event) =>
                  setF((prev) => ({ ...prev, ctaPrimerLabel: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="hero-cta-primer-to" className={labelCls}>
                CTA utama — tautan *
              </label>
              <input
                id="hero-cta-primer-to"
                type="text"
                required
                maxLength={500}
                className={inputCls}
                value={f.ctaPrimerTo}
                onChange={(event) => setF((prev) => ({ ...prev, ctaPrimerTo: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="hero-cta-sekunder-label" className={labelCls}>
                CTA sekunder — label *
              </label>
              <input
                id="hero-cta-sekunder-label"
                type="text"
                required
                maxLength={150}
                className={inputCls}
                value={f.ctaSekunderLabel}
                onChange={(event) =>
                  setF((prev) => ({ ...prev, ctaSekunderLabel: event.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="hero-cta-sekunder-to" className={labelCls}>
                CTA sekunder — tautan *
              </label>
              <input
                id="hero-cta-sekunder-to"
                type="text"
                required
                maxLength={500}
                className={inputCls}
                value={f.ctaSekunderTo}
                onChange={(event) =>
                  setF((prev) => ({ ...prev, ctaSekunderTo: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hero-badge-judul" className={labelCls}>
                Badge — judul *
              </label>
              <input
                id="hero-badge-judul"
                type="text"
                required
                maxLength={150}
                className={inputCls}
                value={f.badgeJudul}
                onChange={(event) => setF((prev) => ({ ...prev, badgeJudul: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="hero-badge-sub" className={labelCls}>
                Badge — keterangan *
              </label>
              <input
                id="hero-badge-sub"
                type="text"
                required
                maxLength={200}
                className={inputCls}
                value={f.badgeSub}
                onChange={(event) => setF((prev) => ({ ...prev, badgeSub: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <label htmlFor="hero-image" className={labelCls}>
              Gambar slide (file JPG/PNG/WebP, maks 2 MB)
            </label>
            <input
              id="hero-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block text-sm"
              onChange={pilihGambar}
            />
            {pratinjau !== null && (
              <img
                src={pratinjau}
                alt="Pratinjau gambar slide"
                className="mt-2 h-24 rounded-lg object-cover"
              />
            )}
            {mode === 'ubah' && f.image !== '' && fileGambar === null && pratinjau === null && (
              <p className="mt-1 text-xs text-muted">
                Gambar saat ini: {f.image} — pilih file baru untuk mengganti.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="hero-srcset" className={labelCls}>
              Srcset (opsional — varian responsif)
            </label>
            <input
              id="hero-srcset"
              type="text"
              maxLength={500}
              placeholder="/hero/ai-center-800.webp 800w, /hero/ai-center-1600.webp 1600w"
              className={inputCls}
              value={f.srcSet}
              onChange={(event) => setF((prev) => ({ ...prev, srcSet: event.target.value }))}
            />
            <p className="mt-1 text-xs text-muted">
              Diisi bila varian gambar (800w/1600w) sudah tersedia; memilih file baru akan
              mengosongkannya otomatis.
            </p>
          </div>
          <div>
            <label htmlFor="hero-sizes" className={labelCls}>
              Sizes (opsional)
            </label>
            <input
              id="hero-sizes"
              type="text"
              maxLength={200}
              placeholder="(max-width: 768px) 100vw, 50vw"
              className={inputCls}
              value={f.sizes}
              onChange={(event) => setF((prev) => ({ ...prev, sizes: event.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={batalkan}
              className="rounded-lg border border-line px-5 py-2 font-semibold hover:bg-soft"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

/**
 * Section edit profil baris tunggal (tab "Profil", Prioritas 2). Isi awal dari
 * GET /api/profil (ambilJson — form kosong bila backend mati/belum di-seed;
 * simpan tetap divalidasi server, 404 bila baris belum ada). Field `visi` satu
 * baris "Judul — Deskripsi"; `misi` satu poin per baris (lihat petakanProfilApi).
 * Kolom `statistik` tidak diedit di sini (PUT server mempertahankannya).
 */
function ProfilAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [f, setF] = useState({
    nama: '',
    tagline: '',
    ringkasan: '',
    alamat: '',
    email: '',
    telepon: '',
    visi: '',
    misi: '',
  });
  const [pesan, setPesan] = useState<{ teks: string; sukses: boolean } | null>(null);

  useEffect(() => {
    void (async () => {
      const profil = await ambilJson<ProfilApi | null>('/profil', null);
      if (profil !== null) {
        setF({
          nama: profil.nama,
          tagline: profil.tagline,
          ringkasan: profil.ringkasan,
          alamat: profil.alamat,
          email: profil.email,
          telepon: profil.telepon,
          visi: profil.visi ?? '',
          misi: profil.misi ?? '',
        });
      }
    })();
  }, []);

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    try {
      await kirimJsonAdmin('/profil', { method: 'PUT', body: f, token });
      setPesan({ teks: 'Profil disimpan.', sukses: true });
    } catch (error) {
      if ((error as { status?: number } | null)?.status === 401) {
        gagal401();
        return;
      }
      setPesan({
        teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
        sukses: false,
      });
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';
  // Field singkat + batas panjang server (lib/tulis BATAS) → maxLength.
  const teks: Array<{ kunci: 'nama' | 'tagline' | 'alamat' | 'email' | 'telepon'; label: string; maks: number }> = [
    { kunci: 'nama', label: 'Nama lembaga', maks: 200 },
    { kunci: 'tagline', label: 'Tagline', maks: 300 },
    { kunci: 'alamat', label: 'Alamat', maks: 500 },
    { kunci: 'email', label: 'Email', maks: 320 },
    { kunci: 'telepon', label: 'Telepon', maks: 50 },
  ];

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Profil</h2>
      </div>

      {elemenPesan}

      <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
        <p className="text-sm text-muted">
          Data profil baris tunggal — visi &amp; misi tampil di halaman Tentang Kami.
        </p>

        {teks.map((field) => (
          <div key={field.kunci}>
            <label htmlFor={`profil-${field.kunci}`} className={labelCls}>
              {field.label} *
            </label>
            <input
              id={`profil-${field.kunci}`}
              type="text"
              required
              maxLength={field.maks}
              className={inputCls}
              value={f[field.kunci]}
              onChange={(event) => setF((prev) => ({ ...prev, [field.kunci]: event.target.value }))}
            />
          </div>
        ))}

        <div>
          <label htmlFor="profil-ringkasan" className={labelCls}>
            Ringkasan *
          </label>
          <textarea
            id="profil-ringkasan"
            required
            rows={3}
            maxLength={2000}
            className={inputCls}
            value={f.ringkasan}
            onChange={(event) => setF((prev) => ({ ...prev, ringkasan: event.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="profil-visi" className={labelCls}>
            Visi (satu baris: Judul — Deskripsi)
          </label>
          <textarea
            id="profil-visi"
            rows={2}
            maxLength={2000}
            className={inputCls}
            value={f.visi}
            onChange={(event) => setF((prev) => ({ ...prev, visi: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted">
            Kosongkan untuk memakai teks bawaan di halaman Tentang Kami.
          </p>
        </div>

        <div>
          <label htmlFor="profil-misi" className={labelCls}>
            Misi (satu poin per baris)
          </label>
          <textarea
            id="profil-misi"
            rows={6}
            maxLength={10000}
            className={inputCls}
            value={f.misi}
            onChange={(event) => setF((prev) => ({ ...prev, misi: event.target.value }))}
          />
          <p className="mt-1 text-xs text-muted">
            Kosongkan untuk menampilkan empty-state &quot;Misi belum tersedia.&quot;
          </p>
        </div>

        <div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            Simpan profil
          </button>
        </div>
      </form>
    </section>
  );
}

/**
 * Section edit konten halaman Inference (tab "Inference" — GET/PUT /api/inference).
 * Isi awal dari GET /api/inference (ambilJson; form kosong bila backend mati atau
 * baris belum di-seed — simpan tetap divalidasi server, 404 bila belum seed).
 *
 * Bentuk edit mengikuti pola yang sudah ada: teks panjang (deskripsi & daftar
 * kebutuhan) berupa textarea satu per baris, sedangkan alur & contoh berupa
 * baris terstruktur seperti editor modul kursus. Batas panjang disalin dari
 * BATAS di server/src/lib/tulis.ts; server tetap penegak utamanya.
 */
function InferenceAdmin({ token, gagal401 }: { token: string; gagal401: () => void }) {
  const [judulApaItu, setJudulApaItu] = useState('');
  const [deskripsiApaItu, setDeskripsiApaItu] = useState('');
  const [contohIntro, setContohIntro] = useState('');
  /** Satu poin per baris; dipecah jadi array saat Simpan. */
  const [kebutuhanTeks, setKebutuhanTeks] = useState('');
  const [alur, setAlur] = useState<LangkahForm[]>([
    { nomor: '', judul: '', deskripsi: '' },
  ]);
  const [contoh, setContoh] = useState<ContohForm[]>([{ slug: '', judul: '' }]);
  const [pesan, setPesan] = useState<{ teks: string; sukses: boolean } | null>(null);

  useEffect(() => {
    void (async () => {
      const konten = await ambilJson<KontenInference | null>('/inference', null);
      if (konten !== null) {
        setJudulApaItu(konten.judulApaItu);
        setDeskripsiApaItu(konten.deskripsiApaItu);
        setContohIntro(konten.contohIntro);
        setKebutuhanTeks(konten.kebutuhan.join('\n'));
        setAlur(konten.alur.length > 0 ? konten.alur : [{ nomor: '', judul: '', deskripsi: '' }]);
        setContoh(konten.contoh.length > 0 ? konten.contoh : [{ slug: '', judul: '' }]);
      }
    })();
  }, []);

  async function simpan(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPesan(null);
    const kebutuhan = kebutuhanTeks
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p !== '');
    if (kebutuhan.length === 0) {
      setPesan({ teks: 'Daftar kebutuhan minimal 1 poin (satu per baris).', sukses: false });
      return;
    }
    try {
      await kirimJsonAdmin('/inference', {
        method: 'PUT',
        body: { judulApaItu, deskripsiApaItu, kebutuhan, alur, contohIntro, contoh },
        token,
      });
      setPesan({ teks: 'Konten inference disimpan.', sukses: true });
    } catch (error) {
      if ((error as { status?: number } | null)?.status === 401) {
        gagal401();
        return;
      }
      setPesan({
        teks: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak dikenal',
        sukses: false,
      });
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

  const inputCls = 'mt-1 w-full rounded-lg border border-line px-3 py-2';
  const labelCls = 'block text-sm font-semibold';

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Inference</h2>
      </div>

      {elemenPesan}

      <form onSubmit={simpan} className="mt-4 space-y-4 rounded-xl border border-line p-5">
        <p className="text-sm text-muted">
          Konten halaman layanan Inference Solution — panel &quot;Apa itu&quot;, tanda kebutuhan,
          alur kerja, dan contoh penerapan.
        </p>

        <div>
          <label htmlFor="inference-judul" className={labelCls}>
            Judul panel &quot;Apa itu&quot; *
          </label>
          <input
            id="inference-judul"
            type="text"
            required
            maxLength={200}
            className={inputCls}
            value={judulApaItu}
            onChange={(event) => setJudulApaItu(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="inference-deskripsi" className={labelCls}>
            Deskripsi panel &quot;Apa itu&quot; *
          </label>
          <textarea
            id="inference-deskripsi"
            required
            rows={5}
            maxLength={5000}
            className={inputCls}
            value={deskripsiApaItu}
            onChange={(event) => setDeskripsiApaItu(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="inference-kebutuhan" className={labelCls}>
            Kapan dibutuhkan (satu poin per baris) *
          </label>
          <textarea
            id="inference-kebutuhan"
            required
            rows={4}
            className={inputCls}
            value={kebutuhanTeks}
            onChange={(event) => setKebutuhanTeks(event.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            Maksimal 20 poin, masing-masing maksimal 300 karakter.
          </p>
        </div>

        <div>
          <p className={labelCls}>Alur kerja (langkah) *</p>
          <ol className="mt-2 space-y-3">
            {alur.map((langkah, i) => (
              <li key={i} className="rounded-lg border border-line p-3">
                <p className="text-xs font-bold text-muted">Langkah {i + 1}</p>
                <input
                  type="text"
                  required
                  aria-label={`Nomor langkah ${i + 1}`}
                  placeholder="01"
                  maxLength={10}
                  className={inputCls}
                  value={langkah.nomor}
                  onChange={(event) =>
                    setAlur((prev) =>
                      prev.map((l, j) => (j === i ? { ...l, nomor: event.target.value } : l)),
                    )
                  }
                />
                <input
                  type="text"
                  required
                  aria-label={`Judul langkah ${i + 1}`}
                  placeholder="Judul langkah"
                  maxLength={200}
                  className={inputCls}
                  value={langkah.judul}
                  onChange={(event) =>
                    setAlur((prev) =>
                      prev.map((l, j) => (j === i ? { ...l, judul: event.target.value } : l)),
                    )
                  }
                />
                <textarea
                  required
                  aria-label={`Deskripsi langkah ${i + 1}`}
                  placeholder="Deskripsi langkah"
                  rows={2}
                  maxLength={1000}
                  className={inputCls}
                  value={langkah.deskripsi}
                  onChange={(event) =>
                    setAlur((prev) =>
                      prev.map((l, j) => (j === i ? { ...l, deskripsi: event.target.value } : l)),
                    )
                  }
                />
                {alur.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAlur((prev) => prev.filter((_, j) => j !== i))}
                    className="mt-2 text-sm font-semibold text-red-700 hover:underline"
                  >
                    Hapus langkah ini
                  </button>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setAlur((prev) => [...prev, { nomor: '', judul: '', deskripsi: '' }])}
            className="mt-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
          >
            + Tambah langkah
          </button>
        </div>

        <div>
          <label htmlFor="inference-contoh-intro" className={labelCls}>
            Pengantar contoh penerapan *
          </label>
          <input
            id="inference-contoh-intro"
            type="text"
            required
            maxLength={500}
            className={inputCls}
            value={contohIntro}
            onChange={(event) => setContohIntro(event.target.value)}
          />
        </div>

        <div>
          <p className={labelCls}>Contoh penerapan (chip) *</p>
          <ol className="mt-2 space-y-3">
            {contoh.map((item, i) => (
              <li key={i} className="rounded-lg border border-line p-3">
                <p className="text-xs font-bold text-muted">Contoh {i + 1}</p>
                <input
                  type="text"
                  required
                  aria-label={`Slug contoh ${i + 1}`}
                  placeholder="algae-finder"
                  maxLength={200}
                  className={inputCls}
                  value={item.slug}
                  onChange={(event) =>
                    setContoh((prev) =>
                      prev.map((c, j) => (j === i ? { ...c, slug: event.target.value } : c)),
                    )
                  }
                />
                <input
                  type="text"
                  required
                  aria-label={`Judul contoh ${i + 1}`}
                  placeholder="Judul karya"
                  maxLength={200}
                  className={inputCls}
                  value={item.judul}
                  onChange={(event) =>
                    setContoh((prev) =>
                      prev.map((c, j) => (j === i ? { ...c, judul: event.target.value } : c)),
                    )
                  }
                />
                {contoh.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContoh((prev) => prev.filter((_, j) => j !== i))}
                    className="mt-2 text-sm font-semibold text-red-700 hover:underline"
                  >
                    Hapus contoh ini
                  </button>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setContoh((prev) => [...prev, { slug: '', judul: '' }])}
            className="mt-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
          >
            + Tambah contoh
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            Simpan inference
          </button>
        </div>
      </form>
    </section>
  );
}
