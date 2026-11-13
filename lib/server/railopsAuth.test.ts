// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { railOpsAuth, RAILOPS_REFRESH_COOKIE } from './railopsAuth';
import { REFRESH_COOKIE } from './authProxy';

const SITE = 'http://localhost:3000';
const RAILOPS = 'https://railops.example';

function req(
  body: unknown,
  { origin = SITE, cookie }: { origin?: string | null; cookie?: string } = {}
) {
  const headers: Record<string, string> = {
    host: 'localhost:3000',
    'content-type': 'application/json',
    'x-real-ip': '203.0.113.9',
  };
  if (origin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  return new NextRequest(`${SITE}/api/auth/x`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

type Reply = { status: number; body?: unknown };
/** Answers by URL path; records every call. */
function services(routes: Record<string, Reply | Reply[]>) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchMock = vi
    .fn()
    .mockImplementation(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      const path = new URL(url).pathname;
      const key = Object.keys(routes).find((k) => path.endsWith(k));
      if (!key) throw new Error(`unexpected call ${url}`);
      const entry = routes[key];
      const reply = Array.isArray(entry) ? entry.shift()! : entry;
      return new Response(
        reply.body === undefined ? null : JSON.stringify(reply.body),
        {
          status: reply.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

const appSession = {
  accessToken: 'railops-access',
  tokenType: 'Bearer',
  expiresIn: 600,
  refreshToken: 'railops-refresh-secret',
  refreshExpiresIn: 1209600,
};
const me = { username: 'asha_1a2b3c', email: 'asha@example.com', role: 'USER' };

describe('RailOps sign-in proxy', () => {
  beforeEach(() => {
    vi.stubEnv('RAILOPS_API_URL', `${RAILOPS}/`);
    vi.stubEnv('RAILOPS_PROXY_SECRET', 'railops-proxy-secret-railops-proxy');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('login: RailOps session + RailLens profile, refresh token only in its own HttpOnly cookie', async () => {
    const calls = services({
      '/api/v1/auth/app/login': { status: 200, body: appSession },
      '/auth/me': { status: 200, body: me },
    });
    const res = await railOpsAuth(
      req({ usernameOrEmail: ' asha@example.com ', password: 'pw' }),
      'login'
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      token: 'railops-access',
      expiresInSeconds: 600,
      refreshToken: null,
      username: 'asha_1a2b3c',
      role: 'USER',
    });
    expect(JSON.stringify(json)).not.toContain('railops-refresh-secret');
    const cookie = res.headers.get('set-cookie')!;
    expect(cookie).toContain(
      `${RAILOPS_REFRESH_COOKIE}=railops-refresh-secret`
    );
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=strict/i);
    expect(RAILOPS_REFRESH_COOKIE).not.toBe(REFRESH_COOKIE);

    expect(calls[0].url).toBe(`${RAILOPS}/api/v1/auth/app/login`);
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      email: 'asha@example.com',
      password: 'pw',
    });
    const h = calls[0].init.headers as Record<string, string>;
    expect(h['X-RailOps-Proxy-Secret']).toBe(
      'railops-proxy-secret-railops-proxy'
    );
    expect(h['X-RailOps-Client-IP']).toBe('203.0.113.9');
    expect(
      (calls[1].init.headers as Record<string, string>).Authorization
    ).toBe('Bearer railops-access');
  });

  it('login: a staff code is passed on; usernames are refused with a clear message', async () => {
    const calls = services({
      '/api/v1/auth/app/login': { status: 200, body: appSession },
      '/auth/me': { status: 200, body: { ...me, role: 'ADMIN' } },
    });
    const ok = await railOpsAuth(
      req({ usernameOrEmail: 'a@x.in', password: 'pw', otp: '123456' }),
      'login'
    );
    expect((await ok.json()).role).toBe('ADMIN');
    expect(JSON.parse(calls[0].init.body as string).otp).toBe('123456');

    const name = await railOpsAuth(
      req({ usernameOrEmail: 'asha', password: 'pw' }),
      'login'
    );
    expect(name.status).toBe(400);
    expect((await name.json()).code).toBe('EMAIL_REQUIRED');
  });

  it('login: wrong password is one generic message, and staff who must set up MFA are sent to RailOps', async () => {
    services({
      '/api/v1/auth/app/login': {
        status: 401,
        body: { code: 'AUTH_FAILED', detail: 'x' },
      },
    });
    const bad = await railOpsAuth(
      req({ usernameOrEmail: 'a@x.in', password: 'pw' }),
      'login'
    );
    expect(bad.status).toBe(401);
    expect(bad.headers.get('set-cookie')).toBeNull();

    services({
      '/api/v1/auth/app/login': {
        status: 200,
        body: { status: 'MFA_ENROLMENT_REQUIRED', enrolmentToken: 'e' },
      },
    });
    const enrol = await railOpsAuth(
      req({ usernameOrEmail: 'a@x.in', password: 'pw' }),
      'login'
    );
    expect(enrol.status).toBe(403);
    expect((await enrol.json()).code).toBe('MFA_SETUP_IN_RAILOPS');
  });

  it('login: if RailLens refuses the profile, the new RailOps session is ended and no cookie is set', async () => {
    const calls = services({
      '/api/v1/auth/app/login': { status: 200, body: appSession },
      '/auth/me': {
        status: 401,
        body: {
          error: 'This email already has a RailLens account that isn’t linked',
        },
      },
      '/api/v1/auth/app/logout': { status: 204 },
    });
    const res = await railOpsAuth(
      req({ usernameOrEmail: 'a@x.in', password: 'pw' }),
      'login'
    );
    expect(res.status).toBe(401);
    expect((await res.json()).error).toContain('isn’t linked');
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(calls.at(-1)!.url).toBe(`${RAILOPS}/api/v1/auth/app/logout`);
    expect(JSON.parse(calls.at(-1)!.init.body as string)).toEqual({
      refreshToken: 'railops-refresh-secret',
    });
  });

  it('register: creates the RailOps account, then signs in', async () => {
    const calls = services({
      '/api/v1/auth/register': { status: 201, body: { userId: 'u' } },
      '/api/v1/auth/app/login': { status: 200, body: appSession },
      '/auth/me': { status: 200, body: me },
    });
    const res = await railOpsAuth(
      req({
        email: 'asha@example.com',
        phone: '9876543210',
        password: 'long-enough-1',
      }),
      'register'
    );
    expect(res.status).toBe(200);
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      email: 'asha@example.com',
      password: 'long-enough-1',
      phone: '9876543210',
    });

    services({
      '/api/v1/auth/register': {
        status: 422,
        body: { code: 'WEAK_PASSWORD', detail: 'this password is too common' },
      },
    });
    const weak = await railOpsAuth(
      req({ email: 'a@x.in', phone: '9876543210', password: 'password123' }),
      'register'
    );
    expect(weak.status).toBe(400);
    expect((await weak.json()).error).toContain('too common');

    services({
      '/api/v1/auth/register': {
        status: 409,
        body: { code: 'ACCOUNT_EXISTS' },
      },
    });
    expect(
      (
        await railOpsAuth(
          req({ email: 'a@x.in', phone: '9876543210', password: 'x' }),
          'register'
        )
      ).status
    ).toBe(409);
  });

  it('refresh: uses only the RailOps cookie, and keeps the rotated token even if RailLens is asleep', async () => {
    expect(
      (
        await railOpsAuth(
          req({}, { cookie: `${REFRESH_COOKIE}=raillens-token` }),
          'refresh'
        )
      ).status
    ).toBe(401);

    const calls = services({
      '/api/v1/auth/app/refresh': {
        status: 200,
        body: { ...appSession, refreshToken: 'rotated' },
      },
      '/auth/me': { status: 503, body: {} },
    });
    const res = await railOpsAuth(
      req({}, { cookie: `${RAILOPS_REFRESH_COOKIE}=old` }),
      'refresh'
    );
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      refreshToken: 'old',
    });
    expect(res.status).toBe(502);
    expect(res.headers.get('set-cookie')).toContain(
      `${RAILOPS_REFRESH_COOKIE}=rotated`
    );
  });

  it('refresh: a refused token is a 401 and the cookie is left alone', async () => {
    services({
      '/api/v1/auth/app/refresh': {
        status: 401,
        body: { code: 'AUTH_FAILED' },
      },
    });
    const res = await railOpsAuth(
      req({}, { cookie: `${RAILOPS_REFRESH_COOKIE}=old` }),
      'refresh'
    );
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('logout: ends the RailOps session and clears the cookie, even if RailOps is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    const res = await railOpsAuth(
      req({}, { cookie: `${RAILOPS_REFRESH_COOKIE}=rt` }),
      'logout'
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('set-cookie')).toMatch(/Max-Age=0/i);
  });

  it('refuses other sites, and says so plainly when RailOps is not configured', async () => {
    expect(
      (await railOpsAuth(req({}, { origin: 'https://evil.example' }), 'login'))
        .status
    ).toBe(403);
    vi.stubEnv('RAILOPS_API_URL', '');
    const res = await railOpsAuth(
      req({ usernameOrEmail: 'a@x.in', password: 'pw' }),
      'login'
    );
    expect(res.status).toBe(503);
  });

  it('MFA setup is not offered here', async () => {
    expect((await railOpsAuth(req({}), 'mfaConfirm')).status).toBe(404);
  });
});
