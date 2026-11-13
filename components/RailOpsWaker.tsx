'use client';

import { useEffect } from 'react';

const KEY = 'raillens-railops-woken-at';
const EVERY_MS = 4 * 60 * 1000;

/**
 * Renders nothing. On pages that will need RailOps (sign-in, booking), asks this site's server to wake the RailOps
 * services (/api/railops/wake), at most once every few minutes per browser tab. See lib/server/railopsWake.ts.
 */
export default function RailOpsWaker() {
  useEffect(() => {
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(KEY) ?? 0);
    } catch {
      // storage blocked: just wake
    }
    const now = Date.now();
    if (now - last < EVERY_MS) return;
    try {
      sessionStorage.setItem(KEY, String(now));
    } catch {
      // ignore
    }
    fetch('/api/railops/wake', { method: 'POST', keepalive: true }).catch(
      () => {}
    );
  }, []);
  return null;
}
