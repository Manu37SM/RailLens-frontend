import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api';
function respond(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  );
}
describe('apiFetch errors', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('carries the server message and machine-readable code', async () => {
    respond(401, { status: 401, error: 'One-time code required', code: 'MFA_REQUIRED' });
    const err = (await apiFetch('/auth/login').catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.message).toBe('One-time code required');
    expect(err.code).toBe('MFA_REQUIRED');
  });
  it('leaves code undefined for ordinary errors', async () => {
    respond(404, { status: 404, error: 'Not found' });
    const err = (await apiFetch('/trains/x').catch((e) => e)) as ApiError;
    expect(err.code).toBeUndefined();
  });
});
