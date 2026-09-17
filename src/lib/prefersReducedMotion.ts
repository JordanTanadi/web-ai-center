/** true bila pengguna meminta reduced motion. Aman di browser lama/SSR (tanpa matchMedia → false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
