'use client';

import { useEffect } from 'react';

/**
 * Registers public/sw.js once the app has hydrated. Split into its own
 * tiny client component (rather than an inline script) so the rest of
 * RootLayout can stay a server component - same reasoning as
 * ThemeToggle/AuthNavLinks being pulled out for client-only concerns.
 * No-ops silently if the browser doesn't support service workers (e.g.
 * some in-app browsers) or in local dev over plain HTTP, where
 * registration would just fail.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration can legitimately fail (no HTTPS, browser policy,
      // etc.) - this is a progressive enhancement, not a hard requirement.
    });
  }, []);

  return null;
}
