/**
 * Konversi URL video → URL embed yang aman di-iframe.
 * Sengaja dibatasi YouTube (mode nocookie) & Vimeo; URL lain mengembalikan
 * `null` sehingga tampilan menawarkan tautan buka tab baru — bukan iframe
 * acak dari domain yang tidak dikenal.
 */

/** ID video YouTube yang valid (5+ karakter [A-Za-z0-9_-]). */
const ID_YOUTUBE = /^[\w-]{5,}$/;

export function embedVideo(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return ID_YOUTUBE.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return ID_YOUTUBE.test(id ?? '') ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    const cocok = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/);
    return cocok && ID_YOUTUBE.test(cocok[1])
      ? `https://www.youtube-nocookie.com/embed/${cocok[1]}`
      : null;
  }
  if (host === 'vimeo.com') {
    const cocok = u.pathname.match(/^\/(\d+)\/?$/);
    return cocok ? `https://player.vimeo.com/video/${cocok[1]}` : null;
  }
  return null;
}
