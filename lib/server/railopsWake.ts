/**
 * Wakes the RailOps services before someone needs them.
 *
 * RailOps runs on Render's free plan, where a service sleeps after 15 idle minutes and only traffic from OUTSIDE
 * Render wakes it: RailOps' own services can't wake each other (a sleeping one answers them with an instant 502).
 * This website's server is outside Render, so when someone opens a page that will need RailOps (sign-in, booking),
 * the page asks this server to ping every RailOps service. By the time the person signs in or checks seats, they are
 * usually up.
 *
 * Which services: RAILOPS_WAKE_URLS (comma-separated base URLs, server-only), plus the gateway (RAILOPS_API_URL or
 * NEXT_PUBLIC_RAILOPS_API_URL). Nothing set: does nothing. At most one round of pings per server instance every
 * WAKE_EVERY_MS, so a busy page can't turn into a stream of requests (or keep RailOps awake, and spend its free
 * hours, when nobody is actually signing in or booking).
 */

export const HEALTH_PATH = '/actuator/health/readiness';
export const WAKE_EVERY_MS = 4 * 60 * 1000;
/** Long enough for Render to receive the request and start the service; the answer itself isn't needed. */
export const PING_TIMEOUT_MS = 25000;

let lastWake = 0;

/** For tests. */
export function resetWakeThrottle() {
  lastWake = 0;
}

function base(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export function wakeTargets(
  env: Record<string, string | undefined> = process.env
): string[] {
  const raw = [
    ...(env.RAILOPS_WAKE_URLS ?? '').split(','),
    env.RAILOPS_API_URL ?? '',
    env.NEXT_PUBLIC_RAILOPS_API_URL ?? '',
  ];
  const out: string[] = [];
  for (const r of raw) {
    if (!r.trim()) continue;
    const b = base(r);
    if (b && !out.includes(b)) out.push(b);
  }
  return out;
}

/**
 * Pings every target once (in parallel), unless that was done less than WAKE_EVERY_MS ago. Never throws.
 * Returns how many services were pinged (0 when throttled or nothing is configured).
 */
export async function wakeRailOps(
  fetchImpl: typeof fetch = fetch,
  now: number = Date.now(),
  env: Record<string, string | undefined> = process.env
): Promise<number> {
  const targets = wakeTargets(env);
  if (targets.length === 0 || now - lastWake < WAKE_EVERY_MS) return 0;
  lastWake = now;
  await Promise.allSettled(
    targets.map((t) =>
      fetchImpl(`${t}${HEALTH_PATH}`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(PING_TIMEOUT_MS),
      })
    )
  );
  return targets.length;
}
