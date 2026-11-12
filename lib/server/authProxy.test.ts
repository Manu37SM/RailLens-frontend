// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { proxyAuth, REFRESH_COOKIE, visitorIp } from './authProxy';
const SITE = 'http://localhost:3000';
function req(
  path: string,
  body: unknown,
  {
    origin = SITE,
    cookie,
    ip = '203.0.113.9',
  }: { origin?: string | null; cookie?: string; ip?: string } = {}
) {
  const headers: Record<string, string> = {
    host: 'localhost:3000',
    'content-type': 'application/json',
    'x-real-ip': ip,
  };
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = `${REFRESH_COOKIE}=${cookie}`;
  return new NextRequest(`${SITE}${path}`, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
function backendReplies(status: number, body: unknown) {
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(body === null ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
const session = {
  token: 'access-jwt',
  tokenType: 'Bearer',
  expiresInSeconds: 3600,
  refreshToken: 'refresh-secret',
  username: 'manish',
  email: 'manish@example.com',
  role: 'USER',
};
describe('sign-in proxy', () => {
  beforeEach(() =>
    vi.stubEnv(
      'RAILLENS_PROXY_SECRET',
      'proxy-secret-proxy-secret-proxy-secret'
    )
  );
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it('login: puts the refresh token in an HttpOnly cookie and never in the response body', async () => {
    backendReplies(200, session);
    const res = await proxyAuth(
      req('/api/auth/login', { usernameOrEmail: 'manish', password: 'x' }),
      '/auth/login',
      'issue'
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe('access-jwt');
    expect(json.refreshToken).toBeNull();
    expect(JSON.stringify(json)).not.toContain('refresh-secret');
    const cookie = res.headers.get('set-cookie')!;
    expect(cookie).toContain(`${REFRESH_COOKIE}=refresh-secret`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=strict/i);
    expect(cookie).toContain('Path=/api/auth');
  });
  it('passes the visitor IP and the shared secret to the backend', async () => {
    const fetchMock = backendReplies(200, session);
    await proxyAuth(req('/api/auth/login', {}), '/auth/login', 'issue');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/v1/auth/login');
    expect(init.headers['X-RailLens-Client-IP']).toBe('203.0.113.9');
    expect(init.headers['X-RailLens-Proxy-Secret']).toBe(
      'proxy-secret-proxy-secret-proxy-secret'
    );
  });
  it('without a configured secret, sends no IP headers (backend falls back to its own view)', async () => {
    vi.stubEnv('RAILLENS_PROXY_SECRET', '');
    const fetchMock = backendReplies(200, session);
    await proxyAuth(req('/api/auth/login', {}), '/auth/login', 'issue');
    expect(
      fetchMock.mock.calls[0][1].headers['X-RailLens-Client-IP']
    ).toBeUndefined();
  });
  it('passes backend errors through unchanged, including the MFA code', async () => {
    backendReplies(401, {
      status: 401,
      error: 'One-time code required',
      code: 'MFA_REQUIRED',
    });
    const res = await proxyAuth(
      req('/api/auth/login', {}),
      '/auth/login',
      'issue'
    );
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('MFA_REQUIRED');
    expect(res.headers.get('set-cookie')).toBeNull();
  });
  it('MFA enrolment-required answers set no cookie', async () => {
    backendReplies(200, {
      ...session,
      token: null,
      refreshToken: null,
      mfaEnrolmentRequired: true,
      enrolmentToken: 'e',
    });
    const res = await proxyAuth(
      req('/api/auth/login', {}),
      '/auth/login',
      'issue'
    );
    expect(res.headers.get('set-cookie')).toBeNull();
    expect((await res.json()).enrolmentToken).toBe('e');
  });
  it('refresh: sends the cookie, rotates it', async () => {
    const fetchMock = backendReplies(200, {
      ...session,
      refreshToken: 'next-secret',
    });
    const res = await proxyAuth(
      req('/api/auth/refresh', {}, { cookie: 'old-secret' }),
      '/auth/refresh',
      'refresh'
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      refreshToken: 'old-secret',
    });
    expect(res.headers.get('set-cookie')).toContain(
      `${REFRESH_COOKIE}=next-secret`
    );
    expect((await res.json()).refreshToken).toBeNull();
  });
  it('refresh: a pre-2B token in the body is moved into the cookie once; the cookie wins if both exist', async () => {
    const fetchMock = backendReplies(200, session);
    await proxyAuth(
      req('/api/auth/refresh', { refreshToken: 'legacy' }),
      '/auth/refresh',
      'refresh'
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      refreshToken: 'legacy',
    });
    await proxyAuth(
      req(
        '/api/auth/refresh',
        { refreshToken: 'legacy' },
        { cookie: 'cookie-token' }
      ),
      '/auth/refresh',
      'refresh'
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      refreshToken: 'cookie-token',
    });
  });
  it('refresh: no cookie and no token is 401 without calling the backend', async () => {
    const fetchMock = backendReplies(200, session);
    const res = await proxyAuth(
      req('/api/auth/refresh', {}),
      '/auth/refresh',
      'refresh'
    );
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('refresh: a rejected token does not delete the cookie (another tab may just have replaced it)', async () => {
    backendReplies(401, {
      status: 401,
      error: 'Invalid or expired refresh token',
    });
    const res = await proxyAuth(
      req('/api/auth/refresh', {}, { cookie: 'old' }),
      '/auth/refresh',
      'refresh'
    );
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });
  it('logout: ends the session on the backend and removes the cookie, even if the backend is down', async () => {
    const fetchMock = backendReplies(204, null);
    const res = await proxyAuth(
      req('/api/auth/logout', {}, { cookie: 'tok' }),
      '/auth/logout',
      'logout'
    );
    expect(res.status).toBe(204);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      refreshToken: 'tok',
    });
    expect(res.headers.get('set-cookie')).toMatch(/Max-Age=0/i);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const offline = await proxyAuth(
      req('/api/auth/logout', {}, { cookie: 'tok' }),
      '/auth/logout',
      'logout'
    );
    expect(offline.status).toBe(204);
    expect(offline.headers.get('set-cookie')).toMatch(/Max-Age=0/i);
  });
  it('refuses calls from other sites or without an Origin', async () => {
    const fetchMock = backendReplies(200, session);
    expect(
      (
        await proxyAuth(
          req('/api/auth/login', {}, { origin: 'https://evil.example' }),
          '/auth/login',
          'issue'
        )
      ).status
    ).toBe(403);
    expect(
      (
        await proxyAuth(
          req('/api/auth/login', {}, { origin: null }),
          '/auth/login',
          'issue'
        )
      ).status
    ).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects oversized or non-JSON bodies', async () => {
    backendReplies(200, session);
    expect(
      (
        await proxyAuth(
          req('/api/auth/login', 'x'.repeat(9000)),
          '/auth/login',
          'issue'
        )
      ).status
    ).toBe(400);
  });
  it('visitorIp accepts only IP literals', () => {
    expect(visitorIp(req('/x', {}, { ip: 'not-an-ip' }))).toBeNull();
    expect(visitorIp(req('/x', {}, { ip: '2001:db8::1' }))).toBe('2001:db8::1');
  });
});
