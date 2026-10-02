import { describe, expect, it } from 'vitest';
import { buildWaLink, kontakDummy, mailLinkKontak, petaUrlKontak, waLinkKontak } from './kontak.ts';

describe('kontakDummy', () => {
  it('memuat semua field wajib dengan nilai valid', () => {
    expect(kontakDummy.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(kontakDummy.whatsappNumber).toMatch(/\d/);
    expect(kontakDummy.websiteUrl).toMatch(/^https:\/\//);
    expect(kontakDummy.instagramUrl).toMatch(/^https:\/\/(www\.)?instagram\.com\//);
    expect(kontakDummy.instagramLabel.trim()).not.toBe('');
    expect(kontakDummy.alamat.length).toBeGreaterThan(0);
    expect(kontakDummy.deskripsiSingkat.trim()).not.toBe('');
    expect(kontakDummy.deskripsiFooter.trim()).not.toBe('');
  });

  it('edge case: instagram placeholder bukan URL kosong', () => {
    expect(kontakDummy.instagramUrl.length).toBeGreaterThan('https://instagram.com/'.length);
  });
});

describe('buildWaLink', () => {
  it('mengonversi nomor lokal diawali 0 ke format 62…', () => {
    expect(buildWaLink('0895-6342-22240')).toBe('https://wa.me/62895634222240');
  });

  it('mempertahankan nomor internasional dan menyertakan pesan ter-encode', () => {
    expect(buildWaLink('6281234567890', 'Halo, saya tertarik')).toBe(
      'https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik',
    );
  });

  it('melempar Error untuk nomor kosong atau tanpa digit (bukan gagal diam-diam)', () => {
    expect(() => buildWaLink('')).toThrow(Error);
    expect(() => buildWaLink('abc-!')).toThrow(/digit/);
  });
});

describe('waLinkKontak', () => {
  it('membangun link dari nomor + pesan pembawa pada data kontak', () => {
    expect(waLinkKontak(kontakDummy)).toBe(
      `https://wa.me/62${kontakDummy.whatsappNumber.replace(/\D/g, '').slice(1)}` +
        `?text=${encodeURIComponent(kontakDummy.whatsappGreeting)}`,
    );
  });
});

describe('mailLinkKontak', () => {
  it('mailto dengan subjek & pesan pembawa terisi (pengalaman seperti link WA)', () => {
    const link = mailLinkKontak(kontakDummy);
    expect(link).toMatch(/^mailto:[^\s?]+@[^\s?]+\.[^\s?]+\?/);
    const params = new URLSearchParams(link.slice(link.indexOf('?') + 1));
    expect(params.get('subject')?.length).toBeGreaterThan(0);
    expect(params.get('body')).toBe(kontakDummy.whatsappGreeting);
  });

  it('subjek default bisa dioverride', () => {
    expect(mailLinkKontak(kontakDummy, 'Demo Model')).toContain(
      `subject=${encodeURIComponent('Demo Model')}`,
    );
  });

  it('melempar Error untuk email kosong (bukan gagal diam-diam)', () => {
    expect(() => mailLinkKontak({ ...kontakDummy, email: '' })).toThrow(/Email/);
  });
});

describe('petaUrlKontak', () => {
  it('terkunci ke pin koordinat (bukan search teks)', () => {
    expect(petaUrlKontak(kontakDummy)).toBe(
      `https://www.google.com/maps/search/?api=1&query=${kontakDummy.latitude},${kontakDummy.longitude}`,
    );
    expect(petaUrlKontak(kontakDummy)).toContain('-7.321919965577327,112.76790932621508');
  });

  it('koordinat dummy valid (rentang Indonesia)', () => {
    expect(kontakDummy.latitude).toBeGreaterThan(-11);
    expect(kontakDummy.latitude).toBeLessThan(6);
    expect(kontakDummy.longitude).toBeGreaterThan(95);
    expect(kontakDummy.longitude).toBeLessThan(141);
  });

  it('melempar Error untuk koordinat invalid (bukan gagal diam-diam)', () => {
    expect(() => petaUrlKontak({ ...kontakDummy, latitude: Number.NaN })).toThrow(/Koordinat/);
    expect(() => petaUrlKontak({ ...kontakDummy, longitude: Number.POSITIVE_INFINITY })).toThrow(
      /Koordinat/,
    );
  });
});
