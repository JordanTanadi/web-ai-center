/**
 * Dashboard admin (konsul PROGRESS 2 fase 3 + lanjutan): login sederhana (1 akun) +
 * CRUD dokumentasi, berita, & kursus (termasuk editor daftar modul).
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
 */
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { ambilDaftar, kirimFileAdmin, kirimJsonAdmin } from '../lib/api.ts';
import type { BeritaItem } from '../data/berita.ts';
import type { DokumentasiItem } from '../data/dokumentasi.ts';
import type { Kursus, Modul } from '../data/pelatihan.ts';

/** Kunci localStorage untuk token sesi admin. */
export const KEY_TOKEN_ADMIN = 'token-admin';

type Jenis = 'dokumentasi' | 'berita' | 'kursus';
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

/** Definisi form dokumentasi & berita — urutan array = urutan render. Kursus
    punya form sendiri (KursusAdmin) karena ada editor daftar modul. */
const FIELD: Record<Exclude<Jenis, 'kursus'>, FieldDef[]> = {
  dokumentasi: [
    { kunci: 'judul', label: 'Judul', wajib: true },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'kategori', label: 'Kategori', wajib: true },
    { kunci: 'gambar', label: 'Gambar (file JPG/PNG/WebP, maks 2 MB)' },
    { kunci: 'deskripsi', label: 'Deskripsi', wajib: true, textarea: true },
  ],
  berita: [
    { kunci: 'judul', label: 'Judul', wajib: true },
    { kunci: 'tanggal', label: 'Tanggal', wajib: true, tanggal: true },
    { kunci: 'penulis', label: 'Penulis', wajib: true },
    { kunci: 'gambar', label: 'Gambar (file JPG/PNG/WebP, maks 2 MB)' },
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
function bodyDariForm(form: Record<string, string>, jenis: Exclude<Jenis, 'kursus'>): Record<string, string> {
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

  /** Muat daftar sesuai jenis aktif (fallback [] bila backend mati). Kursus
      dimuat komponennya sendiri (KursusAdmin). */
  async function muatDaftar(j: Exclude<Jenis, 'kursus'>): Promise<void> {
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
    if (jenis === 'kursus') {
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
    if (token === null || mode === 'daftar' || jenis === 'kursus') return;
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
    if (token === null || jenis === 'kursus') return;
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
          Dashboard internal AI Center Ubaya — kelola dokumentasi, berita & kursus.
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
  };
  const labelJenis = LABEL_JENIS[jenis];
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-muted">Kelola konten dokumentasi, berita & kursus AI Center.</p>
        </div>
        <button
          type="button"
          onClick={keluar}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-soft"
        >
          Keluar
        </button>
      </header>

      <div role="tablist" aria-label="Jenis konten" className="mt-6 flex gap-2">
        {(['dokumentasi', 'berita', 'kursus'] as const).map((j) => (
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

      {jenis === 'kursus' ? (
        <KursusAdmin
          token={token}
          gagal401={() => {
            keluar();
            setPesan({ teks: 'Sesi berakhir — silakan masuk kembali.', sukses: false });
          }}
        />
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

        {elemenPesan}

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
  const teksSingkat: Array<{ kunci: keyof typeof k; label: string }> = [
    { kunci: 'judul', label: 'Judul' },
    { kunci: 'durasi', label: 'Durasi (mis. 4 sesi)' },
    { kunci: 'level', label: 'Level (mis. Pemula)' },
    { kunci: 'format', label: 'Format (mis. Online)' },
    { kunci: 'instruktur', label: 'Instruktur' },
    { kunci: 'peran', label: 'Peran instruktur' },
    { kunci: 'inisial', label: 'Inisial avatar' },
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
                    className={`${inputCls} mt-2`}
                    value={m.judul}
                    onChange={(event) => aturModul(i, 'judul', event.target.value)}
                  />
                  <input
                    type="text"
                    required
                    aria-label={`Meta modul ${i + 1}`}
                    placeholder="Meta (mis. 4 video · 35 menit)"
                    className={inputCls}
                    value={m.meta}
                    onChange={(event) => aturModul(i, 'meta', event.target.value)}
                  />
                  <textarea
                    required
                    aria-label={`Deskripsi modul ${i + 1}`}
                    placeholder="Deskripsi modul"
                    rows={2}
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
