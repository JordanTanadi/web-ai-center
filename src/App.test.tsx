import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.tsx';

describe('App routing (lazy)', () => {
  it('/beranda render setelah chunk dimuat', async () => {
    render(
      <MemoryRouter initialEntries={['/beranda']}>
        <App />
      </MemoryRouter>,
    );
    // Timeout longgar: transform chunk lazy pertama di env test butuh waktu
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 10000 })).toHaveTextContent(/Pusat Riset/);
  });

  it('root redirect ke /beranda', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Pusat Riset/);
  });

  it('rute tak dikenal tampilkan 404', async () => {
    render(
      <MemoryRouter initialEntries={['/tidak-ada']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/tidak ditemukan/i)).toBeInTheDocument();
  });
});
