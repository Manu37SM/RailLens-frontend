// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const afterMock = vi.fn();
vi.mock('next/server', async (orig) => ({
  ...(await orig<typeof import('next/server')>()),
  after: (fn: () => unknown) => afterMock(fn),
}));

import { POST } from './route';

function req(origin: string | null) {
  const headers: Record<string, string> = { host: 'localhost:3000' };
  if (origin) headers.origin = origin;
  return new NextRequest('http://localhost:3000/api/railops/wake', {
    method: 'POST',
    headers,
  });
}

describe('POST /api/railops/wake', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    afterMock.mockReset();
  });

  it('refuses other sites', async () => {
    vi.stubEnv('RAILOPS_WAKE_URLS', 'https://railops-identity.onrender.com');
    expect((await POST(req('https://evil.example'))).status).toBe(403);
    expect((await POST(req(null))).status).toBe(403);
    expect(afterMock).not.toHaveBeenCalled();
  });

  it('does nothing when RailOps is not configured', async () => {
    vi.stubEnv('RAILOPS_WAKE_URLS', '');
    vi.stubEnv('RAILOPS_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_API_URL', '');
    expect((await POST(req('http://localhost:3000'))).status).toBe(204);
    expect(afterMock).not.toHaveBeenCalled();
  });

  it('answers at once and wakes RailOps after the response', async () => {
    vi.stubEnv('RAILOPS_WAKE_URLS', 'https://railops-identity.onrender.com');
    expect((await POST(req('http://localhost:3000'))).status).toBe(202);
    expect(afterMock).toHaveBeenCalledTimes(1);
  });
});
