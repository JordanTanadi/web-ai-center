import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Elemen #root tidak ditemukan di index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    {/* basename mengikuti base Vite: '/' saat dev, '/coding/Web-AI-Center'
        saat build — agar BrowserRouter cocok di kedua mode. */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
