import { describe, expect, it } from 'vitest';
import {
  aksiHeroPelatihan,
  aksesKursus,
  audienceLabel,
  institusiPelatihan,
  infoKursus,
  katalogIntro,
  kategoriKursus,
  kursusCocokFilter,
  kursusDariKode,
  kursusDummy,
  modulUnggulan,
  panelCaraBelajar,
  statsPelatihan,
  waPelatihanInstitusi,
  waTanyaProgram,
} from './pelatihan.ts';

describe('kursusDummy (migrasi fallbackCourses situs lama)', () => {
  it('memuat tepat tiga kursus dengan kode R01, E01, P01', () => {
    expect(kursusDummy.map((k) => k.kode)).toEqual(['R01', 'E01', 'P01']);
  });

  it('setiap kursus lengkap: judul, deskripsi, durasi, instruktur, target, hasil, dan modul', () => {
    const labelValid: string[] = kategoriKursus.filter((k) => k.nilai !== 'all').map((k) => k.label);
    expect(kursusDummy.length).toBeGreaterThan(0);
    for (const k of kursusDummy) {
      expect(k.judul).toBeTruthy();
      expect(k.deskripsi).toBeTruthy();
      expect(k.durasi).toMatch(/sesi/);
      expect(k.instruktur).toBeTruthy();
      expect(k.peran).toBeTruthy();
      expect(k.target.length).toBeGreaterThan(0);
      expect(k.target.every((t) => labelValid.includes(t))).toBe(true);
      expect(k.hasil.length).toBeGreaterThan(0);
      expect(k.modul.length).toBeGreaterThan(0);
      for (const m of k.modul) {
        expect(m.judul).toBeTruthy();
        expect(m.deskripsi).toBeTruthy();
        expect(m.meta).toMatch(/video/);
      }
    }
  });
});

describe('halaman detail kursus (detail-kursus.html)', () => {
  it("kursusDariKode menerima kode apa pun hurufnya, menolak kode asing", () => {
    expect(kursusDariKode('R01')?.judul).toContain('Referensi Jurnal');
    expect(kursusDariKode(' r01 ')?.kode).toBe('R01'); // URL lama memakai huruf kecil
    expect(kursusDariKode('X99')).toBeUndefined();
    expect(kursusDariKode('')).toBeUndefined();
  });

  it('field tambahan halaman detail terisi (tentang, level, format, inisial)', () => {
    for (const k of kursusDummy) {
      expect(k.tentang).toBeTruthy();
      expect(k.level).toBe('Pemula'); // default statis situs lama
      expect(k.format).toBe('Online mandiri'); // default statis situs lama
      expect(k.inisial).toMatch(/^[A-Z]{2}$/);
    }
    expect(kursusDariKode('R01')?.inisial).toBe('RA');
    expect(kursusDariKode('E01')?.inisial).toBe('ED');
    expect(kursusDariKode('P01')?.inisial).toBe('TA');
  });

  it("audienceLabel meniru situs lama: 'Masyarakat umum' dipendekkan jadi 'Umum'", () => {
    expect(audienceLabel(kursusDariKode('R01')!)).toBe('Mahasiswa · Dosen · Umum');
    expect(audienceLabel(kursusDariKode('E01')!)).toBe('Guru · Dosen · Umum');
    expect(audienceLabel(kursusDariKode('P01')!)).toBe('Mahasiswa · Umum');
  });

  it('kartu akses & sidebar informasi mengikuti detail-kursus.html', () => {
    expect(aksesKursus.label).toBe('Akses kursus');
    expect(aksesKursus.judul).toBe('Preview tersedia');
    expect(aksesKursus.catatan).toBe(modulUnggulan.catatanDetail); // satu sumber teks
    expect(aksesKursus.cta).toContain('WhatsApp');
    expect(infoKursus.map((i) => i.label)).toEqual([
      'Penyedia',
      'Sertifikat',
      'Akses materi',
      'Bahasa',
    ]);
    expect(infoKursus[0].nilai).toBe('Ubaya AI Center');
  });
});

describe('kursusCocokFilter', () => {
  it("'all' menampilkan semua; kategori menyaring sesuai target kursus", () => {
    expect(kursusDummy.every((k) => kursusCocokFilter(k, 'all'))).toBe(true);
    expect(kursusDummy.filter((k) => kursusCocokFilter(k, 'mahasiswa')).map((k) => k.kode)).toEqual([
      'R01',
      'P01',
    ]);
    expect(kursusDummy.filter((k) => kursusCocokFilter(k, 'dosen')).map((k) => k.kode)).toEqual(['R01', 'E01']);
    expect(kursusDummy.filter((k) => kursusCocokFilter(k, 'guru')).map((k) => k.kode)).toEqual(['E01']);
    expect(kursusDummy.filter((k) => kursusCocokFilter(k, 'umum')).map((k) => k.kode)).toEqual([
      'R01',
      'E01',
      'P01',
    ]);
  });

  it('nilai kosong/tidak dikenal dianggap tidak cocok (bukan diam-diam tampil semua)', () => {
    expect(kursusCocokFilter(kursusDummy[0], '')).toBe(false);
    expect(kursusCocokFilter(kursusDummy[0], 'profesional')).toBe(false);
  });
});

describe('konten pelatihan lain', () => {
  it('stats, katalog intro, modul unggulan, dan blok institusi terisi', () => {
    expect(statsPelatihan).toHaveLength(3);
    for (const s of statsPelatihan) {
      expect(s.nilai).toBeTruthy();
      expect(s.label).toBeTruthy();
    }
    expect(katalogIntro.eyebrow).toBeTruthy();
    expect(katalogIntro.judul).toBeTruthy();
    expect(katalogIntro.sub).toBeTruthy();
    expect(katalogIntro.kosong).toBeTruthy();
    expect(modulUnggulan.eyebrow).toContain('R01');
    expect(modulUnggulan.topik).toHaveLength(6);
    expect(institusiPelatihan.kicker).toBeTruthy();
    expect(institusiPelatihan.cta).toBeTruthy();
  });

  it('link WhatsApp program/institusi ter-encode dan memuat konteks program', () => {
    const tanya = waTanyaProgram('R01', 'AI untuk mencari referensi jurnal');
    expect(tanya).toMatch(/^https:\/\/wa\.me\/62\d+\?text=/);
    expect(decodeURIComponent(tanya)).toContain('R01');

    const institusi = waPelatihanInstitusi();
    expect(institusi).toMatch(/^https:\/\/wa\.me\/62\d+\?text=/);
    expect(decodeURIComponent(institusi)).toContain('tim/institusi');
  });

  it('copy pendekatan belajar dan tombol hero jelas serta tetap menuju bagian yang tepat', () => {
    expect(panelCaraBelajar.kicker).toBe('Pendekatan belajar');
    expect(panelCaraBelajar.judul).toBe('Dari konsep menuju penerapan.');
    expect(panelCaraBelajar.deskripsi).toContain('studi kasus');
    expect(aksiHeroPelatihan.map((a) => a.label)).toEqual([
      'Lihat program pelatihan',
      'Konsultasi pelatihan tim',
    ]);
    expect(aksiHeroPelatihan.map((a) => a.href)).toEqual(['#katalog', '#layanan-kustom']);
  });
});
