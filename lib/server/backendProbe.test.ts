import { describe, expect, it, vi } from 'vitest';
import {
  combine,
  probeOne,
  probeService,
  raillensHealthUrl,
} from './backendProbe';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('backend probe', () => {
  it('classifies answers', async () => {
    const f = (r: Response | Error) =>
      vi.fn(async () => {
        if (r instanceof Error) throw r;
        return r;
      }) as unknown as typeof fetch;
    expect(await probeOne('u', f(json(200, { status: 'UP' })))).toBe('up');
    expect(await probeOne('u', f(new Error('timeout')))).toBe('waking');
    expect(
      await probeOne(
        'u',
        f(new Response('<html>starting</html>', { status: 200 }))
      )
    ).toBe('waking');
    expect(
      await probeOne('u', f(new Response('Bad Gateway', { status: 502 })))
    ).toBe('down');
    expect(await probeOne('u', f(json(503, { status: 'DOWN' })))).toBe('down');
  });

  it('the worst service decides', () => {
    expect(combine(['up', 'up'])).toBe('up');
    expect(combine(['up', 'waking'])).toBe('waking');
    expect(combine(['waking', 'down', 'up'])).toBe('down');
  });

  it('checks the RailLens health endpoint next to its API, and every RailOps service', async () => {
    expect(
      raillensHealthUrl({
        NEXT_PUBLIC_API_BASE_URL: 'https://raillens-api.onrender.com/api/v1',
      })
    ).toBe('https://raillens-api.onrender.com/actuator/health');
    const seen: string[] = [];
    const f = vi.fn(async (url: string) => {
      seen.push(url);
      return json(200, { status: 'UP' });
    }) as unknown as typeof fetch;
    const env = {
      RAILOPS_WAKE_URLS:
        'https://railops-identity.onrender.com,https://railops-reservation.onrender.com',
      NEXT_PUBLIC_RAILOPS_API_URL: 'https://railops-gateway.onrender.com',
    };
    expect(await probeService('railops', f, env)).toBe('up');
    expect(seen.sort()).toEqual([
      'https://railops-gateway.onrender.com/actuator/health/readiness',
      'https://railops-identity.onrender.com/actuator/health/readiness',
      'https://railops-reservation.onrender.com/actuator/health/readiness',
    ]);
    expect(await probeService('railops', f, {})).toBeNull();
  });
});
