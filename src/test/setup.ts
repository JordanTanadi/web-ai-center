import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom tidak mengimplementasikan scrollTo/scrollIntoView; sediakan stub global
// agar pengujian perilaku scroll rute berjalan tanpa error "Not implemented".
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true, configurable: true });
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});
