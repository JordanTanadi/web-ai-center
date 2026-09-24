/**
 * Perakitan aplikasi: CORS (whitelist origin), penanganan error eksplisit,
 * lalu daftarkan semua route. DB disuntikkan lewat `Repositories`.
 */
import { Elysia } from 'elysia';
// I have nothing but my burger and I want nothing more
import { registerRoutes, type AnyElysia } from './routes';
import type { Repositories } from './repositories/types';

export interface AppDeps {
  repos: Repositories;
  /** Origin frontend yang diizinkan CORS. */
  corsOrigins: string[];
}

export function createApp({ repos, corsOrigins }: AppDeps): AnyElysia {
  const allowedOrigins = new Set(corsOrigins);

  const app = new Elysia()
    // CORS sederhana: echo origin hanya bila ada di whitelist.
    .onRequest(({ request, set }) => {
      const origin = request.headers.get('Origin');
      if (origin !== null && allowedOrigins.has(origin)) {
        set.headers['Access-Control-Allow-Origin'] = origin;
        set.headers['Vary'] = 'Origin';
      }
    })
    .onError(({ code, error, set }) => {
      if (code === 'NOT_FOUND') {
        set.status = 404;
        return { error: 'Not Found' };
      }
      // Log eksplisit — jangan pernah menelan error tanpa jejak.
      console.error('[api] error tidak tertangani:', error);
      set.status = 500;
      return { error: 'Internal Server Error' };
    })
    // Preflight CORS.
    .options('/*', ({ request, set }) => {
      const origin = request.headers.get('Origin');
      set.status = 204;
      set.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS';
      set.headers['Access-Control-Allow-Headers'] = 'content-type';
      set.headers['Access-Control-Max-Age'] = '86400';
      if (origin !== null && allowedOrigins.has(origin)) {
        set.headers['Access-Control-Allow-Origin'] = origin;
        set.headers['Vary'] = 'Origin';
      }
      return null;
    });

  return registerRoutes(app, repos);
}
