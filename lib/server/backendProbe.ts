/**
 * Asks the backends how they are, from this website's server (no CORS, and the request itself wakes a sleeping
 * Render service). Used by /api/backend-status, which the backend-status banner polls.
 *
 *  - up:     the health endpoint answered UP.
 *  - waking: no answer within the timeout, or Render's own "starting" page instead of JSON. A sleeping free service
 *            holds requests while it boots, so this is what a cold start looks like.
 *  - down:   Render answered 502/503/504, or the service reported itself DOWN: crashed (out of memory included),
 *            restarting after a crash, or a failed deploy.
 */
import { HEALTH_PATH, wakeTargets } from './railopsWake';

export type ProbeState = 'up' | 'waking' | 'down';
export type BackendService = 'raillens' | 'railops';

export const PROBE_TIMEOUT_MS = 8000;

export function raillensHealthUrl(
  env: Record<string, string | undefined> = process.env
): string | null {
  const api = env.NEXT_PUBLIC_API_BASE_URL;
  if (!api) return null;
  try {
    const u = new URL(api);
    return `${u.protocol}//${u.host}/actuator/health`;
  } catch {
    return null;
  }
}

/** Every RailOps service the website depends on: booking needs all of them, not only the gateway. */
export function railopsHealthUrls(
  env: Record<string, string | undefined> = process.env
): string[] {
  return wakeTargets(env).map((base) => `${base}${HEALTH_PATH}`);
}

export async function probeOne(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = PROBE_TIMEOUT_MS
): Promise<ProbeState> {
  let res: Response;
  try {
    res = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return 'waking';
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return 'down';
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    return 'waking';
  }
  const status = (body as { status?: unknown } | null)?.status;
  if (res.ok && status === 'UP') return 'up';
  if (status === 'DOWN' || status === 'OUT_OF_SERVICE') return 'down';
  return 'waking';
}

/** Worst state wins: one service down means booking is down; one still waking means not ready yet. */
export function combine(states: ProbeState[]): ProbeState {
  if (states.includes('down')) return 'down';
  if (states.includes('waking')) return 'waking';
  return 'up';
}

/** null when the service isn't configured on this site (nothing to report on). */
export async function probeService(
  service: BackendService,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env
): Promise<ProbeState | null> {
  const urls =
    service === 'raillens'
      ? [raillensHealthUrl(env)].filter((u): u is string => u !== null)
      : railopsHealthUrls(env);
  if (urls.length === 0) return null;
  return combine(await Promise.all(urls.map((u) => probeOne(u, fetchImpl))));
}
