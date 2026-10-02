import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Dibaca dari disk karena ini unit CSS (sumber kebenaran token design).
const css = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf8');

/** Ambil nilai token dari @theme, mis. --color-brand → #3a31e5 */
function token(name: string): string {
  const m = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`Token ${name} tidak ditemukan di src/index.css`);
  return m[1].trim();
}

/** WCAG relative luminance (helper khusus test). */
function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const ch = parseInt(n.slice(i, i + 2), 16) / 255;
    return ch <= 0.04045 ? ch / 12.92 : ((ch + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio 1..21 (helper khusus test). */
function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe('Token identitas visual (src/index.css @theme)', () => {
  it('palet primer persis sesuai daftar warna dari Figma', () => {
    expect(token('--color-brand')).toBe('#2547F4'); // biru royal
    expect(token('--color-brand-bright')).toBe('#0674FD'); // biru terang
    expect(token('--color-navy')).toBe('#0A2240'); // navy surface gelap
    expect(token('--color-ink')).toBe('#0A2240'); // teks utama (peran teks)
    expect(token('--color-soft')).toBe('#FAF7F0'); // krem section
    expect(token('--color-sky')).toBe('#D8EBF8'); // biru muda section
  });

  it('warna pelengkap tersedia sebagai token aksen', () => {
    expect(token('--color-mint')).toBe('#3CFBC5');
    expect(token('--color-yellow')).toBe('#F3D502');
    expect(token('--color-teal')).toBe('#0C7C6C');
    expect(token('--color-orange')).toBe('#FF6B2C');
  });

  it('font identitas: Cabinet Grotesk (judul) + General Sans (isi) + Geist Mono (teknis)', () => {
    expect(token('--font-display')).toContain('Cabinet Grotesk');
    expect(token('--font-display')).toContain('Helvetica Neue'); // fallback sistem
    expect(token('--font-body')).toContain('General Sans');
    expect(token('--font-mono')).toContain('Geist Mono');
    expect(token('--font-mono')).toContain('monospace'); // fallback sistem
    expect(css).toContain('Geist Mono');
  });

  it('@font-face memuat file lokal: isi bobot 400–700 & judul 700–800', () => {
    expect(css).toContain("url('/fonts/GeneralSans-Regular.woff2')");
    expect(css).toContain("url('/fonts/GeneralSans-Medium.woff2')");
    expect(css).toContain("url('/fonts/GeneralSans-SemiBold.woff2')");
    expect(css).toContain("url('/fonts/GeneralSans-Bold.woff2')");
    expect(css).toContain("url('/fonts/CabinetGrotesk-Bold.woff2')");
    expect(css).toContain("url('/fonts/CabinetGrotesk-ExtraBold.woff2')");
    expect(css).not.toContain('fontshare.com'); // self-host, bukan CDN
  });

  it('footer gelap dipertahankan font lamanya (Helvetica) sementara', () => {
    expect(css).toMatch(/\.footer-legacy-font\s*\{[^}]*Helvetica/);
  });
});

describe('Kontras WCAG AA pasangan warna kunci', () => {
  const white = '#ffffff';

  it('teks di atas background terang', () => {
    expect(contrast(token('--color-ink'), white)).toBeGreaterThanOrEqual(7);
    expect(contrast(token('--color-muted'), white)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--color-muted'), token('--color-soft'))).toBeGreaterThanOrEqual(4.5);
  });

  it('brand sebagai teks (link/kicker) di putih dan di section bg-soft', () => {
    expect(contrast(token('--color-brand'), white)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('--color-brand'), token('--color-soft'))).toBeGreaterThanOrEqual(4.5);
  });

  it('teks putih di atas brand & navy (tombol, section dokumentasi, footer)', () => {
    // Ujung gradient tombol = brand → navy; keduanya wajib aman untuk teks putih
    expect(contrast(white, token('--color-brand'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(white, token('--color-navy'))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Gradient tombol utama (.btn-primary)', () => {
  it('memakai gradient 135deg brand → navy (dua ujung aman kontras untuk teks putih)', () => {
    expect(css).toMatch(/\.btn-primary\s*\{[^}]*linear-gradient\(135deg, var\(--color-brand\)/);
    expect(css).toMatch(/var\(--color-navy\)/);
    // hover/active memberi umpan balik → filter brightness
    expect(css).toMatch(/\.btn-primary:hover\s*\{[^}]*brightness/);
  });
});

describe('Tombol aksen konversi (.btn-accent, CTA berani)', () => {
  it('oranye solid + teks navy (bukan teks putih yang gagal kontras)', () => {
    expect(css).toMatch(/\.btn-accent\s*\{[^}]*background-color: var\(--color-orange\)/);
    expect(css).toMatch(/\.btn-accent\s*\{[^}]*color: var\(--color-navy\)/);
    expect(css).toMatch(/\.btn-accent:hover\s*\{[^}]*brightness/);
  });

  it('kontras teks navy di atas oranye ≥ 4.5 (WCAG AA)', () => {
    expect(contrast(token('--color-navy'), token('--color-orange'))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Garis aksen kartu (.card-accent, pola situs patokan)', () => {
  it('gradient 90deg brand → bright yang muncul saat hover/fokus', () => {
    expect(css).toMatch(/\.card-accent::after\s*\{[^}]*linear-gradient\(90deg, var\(--color-brand\)/);
    expect(css).toMatch(/var\(--color-brand-bright\)/);
    expect(css).toMatch(/\.card-accent:hover::after/);
    expect(css).toMatch(/\.card-accent:focus-within::after/);
  });

  it('hover-lift eksplisit (transform + box-shadow) + mati saat reduced-motion', () => {
    expect(css).toMatch(/\.card-accent\s*\{[^}]*transition: transform 200ms ease, box-shadow 200ms ease/);
    expect(css).toMatch(/\.card-accent:hover\s*\{[^}]*translateY\(-6px\)/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).not.toMatch(/transition:\s*all/);
  });
});

describe('Navigasi device-aware (mobile = burger, desktop = navbar)', () => {
  it('memakai custom variant fine-pointer untuk membedakan desktop vs layar sentuh', () => {
    expect(css).toContain('@custom-variant fine-pointer (@media (pointer: fine))');
  });
});
