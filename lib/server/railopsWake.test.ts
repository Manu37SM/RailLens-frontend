// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HEALTH_PATH,
  resetWakeThrottle,
  WAKE_EVERY_MS,
  wakeRailOps,
  wakeTargets,
} from './railopsWake';

const ENV = {
  RAILOPS_WAKE_URLS:
    'https://railops-identity.onrender.com, https://railops-reservation.onrender.com/,https://railops-identity.onrender.com/x',
  RAILOPS_API_URL: 'https://railops-gateway.onrender.com',
  NEXT_PUBLIC_RAILOPS_API_URL: 'https://railops-gateway.onrender.com/',
};

describe('railopsWake', () => {
  beforeEach(() => resetWakeThrottle());

  it('wakes each RailOps service once, gateway included, ignoring paths and duplicates', () => {
    expect(wakeTargets(ENV)).toEqual([
      'https://railops-identity.onrender.com',
      'https://railops-reservation.onrender.com',
      'https://railops-gateway.onrender.com',
    ]);
  });

  it('ignores junk and does nothing when nothing is configured', async () => {
    expect(
      wakeTargets({ RAILOPS_WAKE_URLS: 'not a url, javascript:alert(1)' })
    ).toEqual([]);
    const f = vi.fn();
    expect(await wakeRailOps(f as unknown as typeof fetch, 1_000_000, {})).toBe(
      0
    );
    expect(f).not.toHaveBeenCalled();
  });

  it('pings every health endpoint and swallows failures (a sleeping service answers 502 or times out)', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>502</html>', { status: 502 }))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const n = await wakeRailOps(f as unknown as typeof fetch, 1_000_000, ENV);
    expect(n).toBe(3);
    expect(f.mock.calls.map((c) => c[0])).toEqual([
      `https://railops-identity.onrender.com${HEALTH_PATH}`,
      `https://railops-reservation.onrender.com${HEALTH_PATH}`,
      `https://railops-gateway.onrender.com${HEALTH_PATH}`,
    ]);
    expect(f.mock.calls[0][1]).toMatchObject({
      method: 'GET',
      cache: 'no-store',
    });
  });

  it('pings at most once every few minutes per server instance', async () => {
    const f = vi.fn().mockResolvedValue(new Response('{}'));
    const t = 5_000_000;
    expect(await wakeRailOps(f as unknown as typeof fetch, t, ENV)).toBe(3);
    expect(
      await wakeRailOps(f as unknown as typeof fetch, t + 60_000, ENV)
    ).toBe(0);
    expect(f).toHaveBeenCalledTimes(3);
    expect(
      await wakeRailOps(f as unknown as typeof fetch, t + WAKE_EVERY_MS, ENV)
    ).toBe(3);
    expect(f).toHaveBeenCalledTimes(6);
  });
});
