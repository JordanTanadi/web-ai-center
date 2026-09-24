import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';

const kontenLinks = [
  { to: '/berita', label: 'Berita' },
  { to: '/dokumentasi', label: 'Dokumentasi' },
];

const populerLinks = [
  { to: '/beranda', label: 'Beranda' },
  { to: '/beranda#layanan', label: 'Layanan' },
  { to: '/berita', label: 'Berita' },
  { to: '/dokumentasi', label: 'Dokumentasi' },
  { to: '/tentang-kami', label: 'Hubungi Kami' },
];

const layananLinks = [
  { to: '/beranda#layanan', label: 'Pelatihan' },
  { to: '/beranda#layanan', label: 'Inference Solution' },
];

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded px-1 py-2 text-sm font-medium ${isActive ? 'text-brand' : 'text-ink hover:text-brand'}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const [kontenOpen, setKontenOpen] = useState(false);
  const [kontenMobileOpen, setKontenMobileOpen] = useState(false);
  const kontenRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const kontenActive =
    location.pathname === '/berita' || location.pathname === '/dokumentasi';

  // Tutup dropdown Konten saat rute berubah, tekan Escape, atau klik di luar
  useEffect(() => {
    setKontenOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!kontenOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (kontenRef.current && !kontenRef.current.contains(e.target as Node)) {
        setKontenOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setKontenOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [kontenOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <NavLink to="/beranda" className="flex items-center gap-3" aria-label="AI Center Ubaya beranda">
          <img src="/ubaya_logo.png" alt="Logo Ubaya" width="200" height="67" className="h-9 w-auto" />
          <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
          <img src="/AI-Center_Logo.png" alt="Logo AI Center" width="440" height="116" className="h-10 w-auto" />
        </NavLink>
        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-5 md:flex">
          <NavLink to="/beranda" className={navLinkCls}>
            Beranda
          </NavLink>
          <Link to="/beranda#layanan" className="rounded px-1 py-2 text-sm font-medium text-ink hover:text-brand">
            Layanan
          </Link>
          <div ref={kontenRef} className="relative">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={kontenOpen}
              onClick={() => setKontenOpen((v) => !v)}
              className={`flex items-center gap-1 rounded px-1 py-2 text-sm font-medium ${
                kontenActive ? 'text-brand' : 'text-ink hover:text-brand'
              }`}
            >
              Konten
              <span aria-hidden="true" className={`text-xs transition-transform ${kontenOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {kontenOpen && (
              <div
                role="menu"
                aria-label="Submenu konten"
                className="absolute left-0 top-full min-w-44 rounded-xl border border-line bg-white py-2 shadow-lg"
              >
                {kontenLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    role="menuitem"
                    onClick={() => setKontenOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm ${isActive ? 'font-bold text-brand' : 'text-ink hover:bg-soft hover:text-brand'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/tim" className={navLinkCls}>
            Tim
          </NavLink>
          <NavLink to="/tentang-kami" className={navLinkCls}>
            Tentang Kami
          </NavLink>
          <NavLink to="/tentang-kami" className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark">
            Kontak
          </NavLink>
        </nav>
        <button
          className="ml-auto rounded-lg border border-line px-3 py-2 md:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>
      {open && (
        <nav aria-label="Navigasi seluler" className="flex flex-col gap-1 border-t border-line px-6 py-3 md:hidden">
          <NavLink to="/beranda" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            Beranda
          </NavLink>
          <Link to="/beranda#layanan" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            Layanan
          </Link>
          <button
            type="button"
            aria-expanded={kontenMobileOpen}
            onClick={() => setKontenMobileOpen((v) => !v)}
            className="flex items-center gap-1 rounded px-1 py-2 text-left text-sm font-medium"
          >
            Konten
            <span aria-hidden="true" className="text-xs">
              {kontenMobileOpen ? '▴' : '▾'}
            </span>
          </button>
          {kontenMobileOpen && (
            <div className="flex flex-col gap-1 pl-4">
              {kontenLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded px-1 py-2 text-sm font-medium"
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}
          <NavLink to="/tim" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            Tim
          </NavLink>
          <NavLink to="/tentang-kami" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            Tentang Kami
          </NavLink>
          <NavLink
            to="/tentang-kami"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-lg bg-brand px-4 py-2 text-center text-sm font-bold text-white"
          >
            Kontak
          </NavLink>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer id="kontak" className="bg-[#14173a] text-sm text-[#c9cde6]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.25fr_1.15fr_0.8fr_0.8fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-white px-4 py-2 lg:flex-nowrap">
            <img src="/ubaya_logo.png" alt="Logo Ubaya" width="200" height="67" className="h-7 w-auto max-w-full shrink-0" loading="lazy" />
            <span className="h-7 w-px shrink-0 bg-line" aria-hidden="true" />
            <img
              src="/AI-Center_Logo.png"
              alt="Logo AI Center"
              width="440"
              height="116"
              className="h-8 w-auto max-w-full min-w-0 object-contain"
              loading="lazy"
            />
          </div>
          <p className="font-display font-bold text-white">Tentang AI Center</p>
          <p className="mt-2 text-[13px]">{kontakDummy.deskripsiFooter}</p>
        </div>
        <div>
          <p className="font-display font-bold text-white">AI Center Universitas Surabaya</p>
          <address className="mt-2 text-[13px] not-italic">
            {kontakDummy.alamat.join(', ')}
            <br />
            <a
              href={`mailto:${kontakDummy.email}`}
              className="inline-block min-h-6 py-1 hover:text-white hover:underline"
            >
              {kontakDummy.email}
            </a>
            <br />
            <a
              href={waLinkKontak(kontakDummy)}
              target="_blank"
              rel="noreferrer"
              className="inline-block min-h-6 py-1 hover:text-white hover:underline"
            >
              WhatsApp {kontakDummy.whatsappDisplay} ↗
            </a>
            <br />
            <a
              href={kontakDummy.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block min-h-6 py-1 hover:text-white hover:underline"
            >
              {kontakDummy.websiteLabel} ↗
            </a>
          </address>
        </div>
        <nav aria-label="Halaman populer">
          <p className="font-display font-bold text-white">Halaman Populer</p>
          <ul className="mt-2 space-y-1">
            {populerLinks.map((l) => (
              <li key={l.label}>
                {l.to.includes('#') ? (
                  <Link to={l.to} className="hover:text-white hover:underline">
                    {l.label}
                  </Link>
                ) : (
                  <NavLink to={l.to} className="hover:text-white hover:underline">
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Layanan AI Center">
          <p className="font-display font-bold text-white">Layanan</p>
          <ul className="mt-2 space-y-1">
            {layananLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-[#9aa0c7]">
        © {new Date().getFullYear()} AI Center Universitas Surabaya
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-2">
        Lewati ke konten
      </a>
      <Header />
      <main id="konten" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
