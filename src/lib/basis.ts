// Basis URL deployment — agar build bisa disajikan dari subfolder XAMPP
// (mis. /coding/Web-AI-Center/) maupun root. `import.meta.env.BASE_URL`
// berisi '/' saat dev dan '/coding/Web-AI-Center/' saat build (vite.config.ts).
// Data (src/data, respons API) menyimpan path logis root-absolut ('/tim/x.jpg');
// helper ini dipanggil saat render untuk mengawali path dengan basis.

/** Awalan basis saat ini, selalu diakhiri '/'. */
export function basisUrl(): string {
  const mentah = import.meta.env.BASE_URL ?? '/';
  return mentah.endsWith('/') ? mentah : `${mentah}/`;
}

/**
 * Ubah path aset public/API menjadi URL siap render.
 * - Path absolut eksternal ('https://…', '//…', 'data:…') dikembalikan utuh.
 * - Path yang sudah berawalan basis dikembalikan utuh (idempoten).
 * - Path root-absolut ('/tim/x.jpg') diawali basis.
 * - Path relatif ('tim/x.jpg') juga diawali basis.
 *
 * @throws {Error} bila path kosong.
 */
export function aset(jalur: string): string {
  if (!jalur || jalur.trim() === '') {
    throw new Error('Path aset kosong');
  }
  if (/^(https?:)?\/\/|^data:/i.test(jalur)) {
    return jalur;
  }
  const basis = basisUrl();
  if (jalur.startsWith(basis)) {
    return jalur;
  }
  return `${basis}${jalur.replace(/^\/+/, '')}`;
}

/**
 * Terapkan `aset()` pada atribut srcSet ('url lebar, url lebar…').
 * Entri tanpa URL (string kosong) dikembalikan utuh.
 */
export function srcSetBerbasis(nilai?: string): string | undefined {
  if (nilai === undefined || nilai.trim() === '') {
    return nilai;
  }
  return nilai
    .split(',')
    .map((entri) => {
      const bagian = entri.trim().split(/\s+/);
      const [url, ...deskriptor] = bagian;
      if (!url) return entri;
      return [aset(url), ...deskriptor].join(' ');
    })
    .join(', ');
}
