import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
/**
 * Server-side sign-in proxy (Phase 2B). Runs on the website's own server, never in the browser.
 *
 * Login, register, refresh, logout and MFA confirm come here instead of going straight to the backend, so the
 * refresh token can live in an HttpOnly, SameSite=Strict cookie on this site's own domain: page scripts can't read
 * it, and other sites can't make the browser send it. The backend API is unchanged (the mobile app still uses it
 * directly); this route just moves the token between the backend's JSON and the cookie.
 *
 * Because the backend now sees this server's IP, the visitor's IP is passed on in X-RailLens-Client-IP with the
 * shared secret X-RailLens-Proxy-Secret, so per-visitor rate limits keep working (backend: ClientIpResolver).
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const PRODUCTION = process.env.NODE_ENV === 'production';
/** __Secure- makes browsers refuse the cookie unless it is Secure and set over HTTPS. */
export const REFRESH_COOKIE = PRODUCTION
  ? '__Secure-raillens_rt'
  : 'raillens_rt';
/** Sent only to these sign-in routes, never with page loads or other requests. */
export const REFRESH_COOKIE_PATH = '/api/auth';
/** Matches the backend's refresh-token lifetime; the backend still enforces the real expiry (admins: 12 h). */
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const MAX_BODY_BYTES = 8 * 1024;
/** The free backend can take about a minute to wake up. */
const BACKEND_TIMEOUT_MS = 60000;
type Mode = 'issue' | 'refresh' | 'logout';
export function errorBody(status: number, error: string) {
  return NextResponse.json(
    { timestamp: new Date().toISOString(), status, error },
    { status }
  );
}
/** Only this site's own pages may call these routes (on top of SameSite=Strict). */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
/** On Vercel, x-real-ip and x-forwarded-for are set by Vercel itself (client values are overwritten). */
export function visitorIp(request: NextRequest): string | null {
  const candidates = [
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0],
  ];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}
export async function readJson(
  request: NextRequest
): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}
function setRefreshCookie(response: NextResponse, value: string) {
  response.cookies.set(REFRESH_COOKIE, value, {
    httpOnly: true,
    secure: PRODUCTION,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}
function clearRefreshCookie(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: PRODUCTION,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
}
async function callBackend(
  request: NextRequest,
  backendPath: string,
  body: unknown
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const secret = process.env.RAILLENS_PROXY_SECRET;
  const ip = visitorIp(request);
  if (secret && ip) {
    headers['X-RailLens-Proxy-Secret'] = secret;
    headers['X-RailLens-Client-IP'] = ip;
  }
  return fetch(`${API_BASE_URL}${backendPath}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}
/**
 * issue:   login / register / MFA confirm. Body passed through; a refreshToken in the answer goes into the cookie.
 * refresh: the cookie (or, once, a pre-2B token from the body) is exchanged for a new pair; the new one replaces it.
 * logout:  the cookie's session is ended on the backend and the cookie removed.
 * The backend's error JSON (status, message, code such as MFA_REQUIRED) is passed through unchanged.
 */
export async function proxyAuth(
  request: NextRequest,
  backendPath: string,
  mode: Mode
): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return errorBody(403, 'Request not allowed');
  }
  const body = await readJson(request);
  if (body === null) {
    return errorBody(400, 'Request body is missing or not valid JSON');
  }
  const cookieToken = request.cookies.get(REFRESH_COOKIE)?.value || null;
  let backendBody: unknown = body;
  if (mode === 'refresh' || mode === 'logout') {
    const legacy =
      typeof body.refreshToken === 'string' ? body.refreshToken : null;
    const token = cookieToken ?? (mode === 'refresh' ? legacy : null);
    if (!token) {
      if (mode === 'logout') {
        const done = new NextResponse(null, { status: 204 });
        clearRefreshCookie(done);
        return done;
      }
      return errorBody(401, 'Not signed in');
    }
    backendBody = { refreshToken: token };
  }
  let upstream: Response;
  try {
    upstream = await callBackend(request, backendPath, backendBody);
  } catch {
    if (mode === 'logout') {
      // Still sign out of this browser; the backend session expires on its own.
      const done = new NextResponse(null, { status: 204 });
      clearRefreshCookie(done);
      return done;
    }
    return errorBody(
      502,
      'Unable to reach the server. Please try again in a minute.'
    );
  }
  if (mode === 'logout') {
    const done = new NextResponse(null, { status: 204 });
    clearRefreshCookie(done);
    return done;
  }
  const text = await upstream.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!upstream.ok || !json) {
    // Note: a failed refresh does NOT clear the cookie. With two tabs, the loser of a refresh race must not delete
    // the winner's brand-new cookie; an expired cookie simply stops working.
    return NextResponse.json(
      json ?? { status: upstream.status, error: 'Request failed' },
      {
        status: upstream.status,
      }
    );
  }
  const refreshToken =
    typeof json.refreshToken === 'string' ? json.refreshToken : null;
  const response = NextResponse.json(
    { ...json, refreshToken: null },
    { status: upstream.status }
  );
  if (refreshToken) {
    setRefreshCookie(response, refreshToken);
  }
  return response;
}
