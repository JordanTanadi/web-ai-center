import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { kontakDummy, waLinkKontak } from '../data/kontak.ts';
import { useT } from '../lib/i18n.tsx';
import LanguageToggle from './LanguageToggle.tsx';

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
  { to: '/layanan/pelatihan', label: 'Pelatihan' },
  { to: '/layanan/inference-solution', label: 'Inference Solution' },
];

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded px-1 py-2 text-sm font-medium ${isActive ? 'text-brand' : 'text-ink hover:text-brand'}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const [kontenOpen, setKontenOpen] = useState(false);
  const [kontenMobileOpen, setKontenMobileOpen] = useState(false);
  const kontenRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const kontenActive =
    location.pathname === '/berita' || location.pathname === '/dokumentasi';
  const t = useT();

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
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 md:fine-pointer:max-lg:gap-4">
        <NavLink to="/beranda" className="flex items-center gap-3" aria-label="AI Center Ubaya beranda">
          {/* Logo kompak: besar di <640px & ≥1024px; mengecil di 640–767px (header burger)
              dan 768–1023px (navbar desktop mode kompak) agar tidak overflow */}
          <img src="/ubaya_logo.png" alt="Logo Ubaya" width="200" height="67" className="h-7 w-auto sm:max-md:h-9 lg:h-9" />
          <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
          <img src="/AI-Center_Logo.png" alt="Logo AI Center" width="440" height="116" className="h-8 w-auto sm:max-md:h-10 lg:h-10" />
        </NavLink>
        {/* Navbar vs burger ditentukan DEVICE (pointer), bukan hanya lebar jendela:
            desktop/laptop = selalu navbar — kompak di 768–1023px agar tetap muat;
            layar sentuh (HP/tablet) <1024px = burger; di bawah 768px navbar tidak
            muat untuk siapa pun, jadi semua perangkat memakai burger. */}
        {/* Wrapper ml-auto: logo di kiri, nav + toggle + burger rata kanan
            (di layar sempit nav tersembunyi → toggle & burger tetap rata kanan). */}
        <div className="ml-auto flex items-center gap-3">
          <nav
            aria-label={t('Navigasi utama')}
            className="hidden items-center gap-5 md:fine-pointer:max-lg:flex md:fine-pointer:max-lg:gap-3 lg:flex"
          >
            <NavLink to="/beranda" className={navLinkCls}>
              {t('Beranda')}
            </NavLink>
            <Link
              to="/beranda#layanan"
              className="whitespace-nowrap rounded px-1 py-2 text-sm font-medium text-ink hover:text-brand"
            >
              {t('Layanan')}
            </Link>
            <div ref={kontenRef} className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={kontenOpen}
                onClick={() => setKontenOpen((v) => !v)}
                className={`flex items-center gap-1 whitespace-nowrap rounded px-1 py-2 text-sm font-medium ${
                  kontenActive ? 'text-brand' : 'text-ink hover:text-brand'
                }`}
              >
                {t('Konten')}
                <span aria-hidden="true" className={`text-xs transition-transform ${kontenOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              {kontenOpen && (
                <div
                  role="menu"
                  aria-label={t('Submenu konten')}
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
                      {t(l.label)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/tim" className={navLinkCls}>
              {t('Tim')}
            </NavLink>
            <NavLink to="/tentang-kami" className={navLinkCls}>
              {t('Tentang Kami')}
            </NavLink>
            <NavLink to="/tentang-kami" className="btn-primary whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold text-white md:fine-pointer:max-lg:px-3 lg:px-4">
              {t('Kontak')}
            </NavLink>
          </nav>
          <LanguageToggle />
          <button
            className="rounded-lg border border-line px-3 py-2 md:fine-pointer:hidden lg:hidden"
            aria-label={t(open ? 'Tutup menu' : 'Buka menu')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label={t('Navigasi seluler')} className="flex flex-col gap-1 border-t border-line px-6 py-3 md:fine-pointer:hidden lg:hidden">
          <NavLink to="/beranda" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            {t('Beranda')}
          </NavLink>
          <Link to="/beranda#layanan" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            {t('Layanan')}
          </Link>
          <button
            type="button"
            aria-expanded={kontenMobileOpen}
            onClick={() => setKontenMobileOpen((v) => !v)}
            className="flex items-center gap-1 rounded px-1 py-2 text-left text-sm font-medium"
          >
            {t('Konten')}
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
                  {t(l.label)}
                </NavLink>
              ))}
            </div>
          )}
          <NavLink to="/tim" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            {t('Tim')}
          </NavLink>
          <NavLink to="/tentang-kami" onClick={() => setOpen(false)} className="rounded px-1 py-2 text-sm font-medium">
            {t('Tentang Kami')}
          </NavLink>
          <NavLink
            to="/tentang-kami"
            onClick={() => setOpen(false)}
            className="btn-primary mt-1 rounded-lg px-4 py-2 text-center text-sm font-bold text-white"
          >
            {t('Kontak')}
          </NavLink>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer id="kontak" className="footer-legacy-font bg-navy text-sm text-[#c9cde6]">
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
          <p className="font-display font-bold text-white">{t('Tentang AI Center')}</p>
          <p className="mt-2 text-[13px]">{t(kontakDummy.deskripsiFooter)}</p>
        </div>
        <div>
          <p className="font-display font-bold text-white">AI Center Universitas Surabaya</p>
          <address className="mt-2 text-[13px] not-italic">
            {kontakDummy.alamat.map(t).join(', ')}
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
        <nav aria-label={t('Halaman populer')}>
          <p className="font-display font-bold text-white">{t('Halaman Populer')}</p>
          <ul className="mt-2 space-y-1">
            {populerLinks.map((l) => (
              <li key={l.label}>
                {l.to.includes('#') ? (
                  <Link to={l.to} className="hover:text-white hover:underline">
                    {t(l.label)}
                  </Link>
                ) : (
                  <NavLink to={l.to} className="hover:text-white hover:underline">
                    {t(l.label)}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t('Layanan AI Center')}>
          <p className="font-display font-bold text-white">{t('Layanan')}</p>
          <ul className="mt-2 space-y-1">
            {layananLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-white hover:underline">
                  {t(l.label)}
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
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-2">
        {t('Lewati ke konten')}
      </a>
      <Header />
      <main id="konten" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
