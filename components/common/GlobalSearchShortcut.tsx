'use client';

import { useGlobalSearchShortcut } from '@/hooks/useGlobalSearchShortcut';

/**
 * Renders nothing - exists purely to mount useGlobalSearchShortcut from
 * RootLayout (a server component) without converting the whole layout to
 * a client component. Same pattern as ServiceWorkerRegister.
 */
export default function GlobalSearchShortcut() {
  useGlobalSearchShortcut();
  return null;
}
