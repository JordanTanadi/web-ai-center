import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.tsx';

describe('App routing (lazy)', () => {
  // Timeout test 30 dtk > timeout findBy (20 dtk): transform chunk lazy pertama
  // bisa lambat saat suite penuh atau dijalankan paralel — jangan sampai
  // timeout test menang duluan.
  it(
    '/beranda render setelah chunk dimuat',
    async () => {
      render(
        <MemoryRouter initialEntries={['/beranda']}>
          <App />
        </MemoryRouter>,
      );
      // Timeout longgar: transform chunk lazy pertama di env test butuh waktu
      expect(await screen.findByRole('heading', { level: 1 }, { timeout: 20000 })).toHaveTextContent(/Pusat Riset/);
    },
    30000,
  );

  it(
    'root redirect ke /beranda',
    async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      );
      expect(await screen.findByRole('heading', { level: 1 }, { timeout: 20000 })).toHaveTextContent(/Pusat Riset/);
    },
    30000,
  );

  it(
    'rute tak dikenal tampilkan 404',
    async () => {
      render(
        <MemoryRouter initialEntries={['/tidak-ada']}>
          <App />
        </MemoryRouter>,
      );
      expect(
        await screen.findByText(/tidak ditemukan/i, {}, { timeout: 20000 }),
      ).toBeInTheDocument();
    },
    30000,
  );
});
