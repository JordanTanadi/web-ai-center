import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest selalu berjalan dari root proyek (root config = cwd), jadi pakai cwd
// karena import.meta.url bukan scheme file:// di environment jsdom.
const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

describe('index.html (SEO & performa)', () => {
  it('font identitas di-self-host (public/fonts) & dipreload — tanpa CDN eksternal', () => {
    // General Sans (isi) + Cabinet Grotesk (judul) diunduh ke public/fonts
    expect(html).toContain('as="font"');
    expect(html).toContain('href="/fonts/GeneralSans-Regular.woff2"');
    expect(html).toContain('href="/fonts/CabinetGrotesk-Bold.woff2"');
    // API Fontshare dulu membalas Satoshi → General Sans gagal & jatuh ke Helvetica
    expect(html).not.toContain('fontshare.com');
    // Geist Mono sudah tidak dipakai (label ganti font isi)
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('Geist+Mono');
    // Font lama sudah tidak dipakai
    expect(html).not.toContain('Poppins');
    expect(html).not.toContain('Open+Sans');
  });

  it('meta wajib: description, theme-color, viewport aman (tanpa zoom-disable)', () => {
    expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]+"/);
    expect(html).toContain('name="theme-color"');
    expect(html).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/);
  });

  it('preload LCP menunjuk aset yang ada (bukan path usang)', () => {
    expect(html).toContain('rel="preload"');
    expect(html).not.toContain('hero-1.jpg');
  });
});
