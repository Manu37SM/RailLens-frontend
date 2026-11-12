// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const token = vi.fn();
vi.mock('@/lib/sessionRefresh', () => ({ getValidAccessToken: () => token() }));

import { createBooking, findRun, paySimulated } from './bookingService';
import { ApiError } from './api';

function replies(status: number, body: unknown) {
  const f = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', f);
  return f;
}

describe('RailOps booking calls', () => {
  beforeEach(() =>
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_API_URL', 'https://railops.example/')
  );
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    token.mockReset();
  });

  it('run lookup is public: no token is sent', async () => {
    const f = replies(200, { runId: 1 });
    await findRun('12951', '2026-11-20');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe(
      'https://railops.example/api/v1/runs?trainNo=12951&date=2026-11-20'
    );
    expect(init.headers.Authorization).toBeUndefined();
    expect(token).not.toHaveBeenCalled();
  });

  it('booking sends the RailOps token and the idempotency key, and never an amount', async () => {
    token.mockResolvedValue('ro-access');
    const f = replies(201, { pnr: '4123456789' });
    await createBooking(
      {
        trainRunId: 1,
        fromStopSeq: 0,
        toStopSeq: 4,
        travelClass: '3A',
        quota: 'GN',
        passengers: [{ name: 'A', age: 30, gender: 'F' }],
        onlyIfConfirmed: false,
        contactPhone: '9820012345',
      },
      'key-1234567890abcdef'
    );
    const [, init] = f.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer ro-access');
    expect(init.headers['Idempotency-Key']).toBe('key-1234567890abcdef');
    expect(init.body).not.toMatch(/fare|amount/i);
  });

  it('signed out means no call at all, and RailOps errors keep their code', async () => {
    token.mockResolvedValue(null);
    const f = replies(200, {});
    await expect(paySimulated('4123456789', 'SUCCESS')).rejects.toMatchObject({
      status: 401,
    });
    expect(f).not.toHaveBeenCalled();

    token.mockResolvedValue('t');
    replies(404, { code: 'RES_SIMULATED_PAYMENTS_OFF' });
    const err = await paySimulated('4123456789', 'SUCCESS').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('RES_SIMULATED_PAYMENTS_OFF');
  });
});
