import { NextRequest, NextResponse } from 'next/server';
import {
  errorBody,
  isSameOrigin,
  readJson,
  REFRESH_COOKIE_PATH,
  visitorIp,
} from './authProxy';

/**
 * Server-side sign-in through the RailOps login (single login, Phase 4D; used when
 * NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER=railops). Same contract towards the browser as proxyAuth: the answer has the
 * RailLens shape (token, username, email, role) and the refresh token only ever lives in an HttpOnly cookie.
 *
 * Steps: RailOps' app endpoints (refresh token in the body, /api/v1/auth/app/*) give a session; RailLens' own
 * backend then answers /auth/me for that RailOps access token, which links or creates the RailLens profile and says
 * whether the person is an admin. Password change and account closing need no route here: the website calls RailLens
 * as before, and RailLens forwards them to RailOps for linked profiles.
 *
 * Separate cookie name from the RailLens provider, so a RailLens refresh token is never sent to RailOps (or back)
 * when the setting is flipped; people simply sign in once more after a switch.
 */
const RAILLENS_API =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const PRODUCTION = process.env.NODE_ENV === 'production';
export const RAILOPS_REFRESH_COOKIE = PRODUCTION
  ? '__Secure-raillens_ro_rt'
  : 'raillens_ro_rt';
/** Per call. Up to three calls share the route's 60 s, so a service that is still waking up fails fast and the visitor retries. */
const TIMEOUT_MS = 25000;
const OTP_PATTERN = /^\d{6}$/;

export type RailOpsAction =
  'login' | 'register' | 'refresh' | 'logout' | 'mfaConfirm';

interface AppSession {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
}

class Failure {
  constructor(
    readonly status: number,
    readonly message: string,
    readonly code?: string
  ) {}
}

function fail(status: number, message: string, code?: string): NextResponse {
  return NextResponse.json(
    { timestamp: new Date().toISOString(), status, error: message, code },
    { status }
  );
}

function railOpsBase(): string | null {
  const url = process.env.RAILOPS_API_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

/** Lets the RailOps gateway rate-limit per visitor rather than per website server (RAILOPS_EDGE_PROXY_SECRET). */
function railOpsHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const secret = process.env.RAILOPS_PROXY_SECRET;
  const ip = visitorIp(request);
  if (secret && ip) {
    headers['X-RailOps-Proxy-Secret'] = secret;
    headers['X-RailOps-Client-IP'] = ip;
  }
  return headers;
}

async function railOps(
  request: NextRequest,
  path: string,
  body: unknown
): Promise<{ status: number; json: Record<string, unknown> | null }> {
  const base = railOpsBase();
  if (!base) {
    throw new Failure(
      503,
      'Sign-in is not configured yet. Please try again later.'
    );
  }
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: railOpsHeaders(request),
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Failure(
      502,
      'Unable to reach the server. Please try again in a minute.'
    );
  }
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

/** RailOps answers with problem details ({ code, detail }); the website shows RailLens-style messages. */
function railOpsFailure(
  status: number,
  json: Record<string, unknown> | null
): Failure {
  const code = typeof json?.code === 'string' ? json.code : undefined;
  if (status === 401)
    return new Failure(
      401,
      'Invalid email, password or code.',
      'INVALID_CREDENTIALS'
    );
  if (status === 429)
    return new Failure(
      429,
      'Too many attempts. Please wait a minute and try again.',
      'RATE_LIMITED'
    );
  if (status === 409 || code === 'ACCOUNT_EXISTS')
    return new Failure(
      409,
      'An account with this email or phone number already exists.',
      'ACCOUNT_EXISTS'
    );
  if (status === 422 && typeof json?.detail === 'string')
    return new Failure(
      400,
      `Choose a stronger password: ${json.detail}.`,
      code ?? 'WEAK_PASSWORD'
    );
  if (status === 400)
    return new Failure(
      400,
      'Check the details you entered and try again.',
      'VALIDATION_ERROR'
    );
  return new Failure(
    502,
    'Sign-in is unavailable right now. Please try again in a minute.'
  );
}

function asSession(json: Record<string, unknown> | null): AppSession | null {
  if (
    typeof json?.accessToken === 'string' &&
    typeof json.refreshToken === 'string' &&
    typeof json.expiresIn === 'number' &&
    typeof json.refreshExpiresIn === 'number'
  ) {
    return json as unknown as AppSession;
  }
  return null;
}

/** RailLens' profile for this RailOps access token (links or creates it on first use). */
async function profile(
  request: NextRequest,
  accessToken: string
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  const secret = process.env.RAILLENS_PROXY_SECRET;
  const ip = visitorIp(request);
  if (secret && ip) {
    headers['X-RailLens-Proxy-Secret'] = secret;
    headers['X-RailLens-Client-IP'] = ip;
  }
  let res: Response;
  try {
    res = await fetch(`${RAILLENS_API}/auth/me`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new Failure(
      502,
      'Unable to reach the server. Please try again in a minute.'
    );
  }
  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!res.ok || typeof json?.username !== 'string') {
    // e.g. 401 "This email already has a RailLens account that isn't linked..." - shown as is.
    const message =
      typeof json?.error === 'string' ? json.error : 'Request failed';
    throw new Failure(
      res.status === 401 ? 401 : 502,
      message,
      typeof json?.code === 'string' ? json.code : undefined
    );
  }
  return json;
}

function setCookie(response: NextResponse, value: string, maxAge: number) {
  response.cookies.set(RAILOPS_REFRESH_COOKIE, value, {
    httpOnly: true,
    secure: PRODUCTION,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge,
  });
}

function signedIn(
  session: AppSession,
  me: Record<string, unknown>
): NextResponse {
  const response = NextResponse.json({
    token: session.accessToken,
    tokenType: 'Bearer',
    expiresInSeconds: session.expiresIn,
    refreshToken: null,
    username: me.username,
    email: me.email,
    role: me.role === 'ADMIN' ? 'ADMIN' : 'USER',
  });
  response.headers.set('Cache-Control', 'no-store');
  setCookie(response, session.refreshToken, session.refreshExpiresIn);
  return response;
}

async function endQuietly(request: NextRequest, refreshToken: string) {
  try {
    await railOps(request, '/api/v1/auth/app/logout', { refreshToken });
  } catch {
    // The session expires on its own.
  }
}

async function logIn(
  request: NextRequest,
  email: string,
  password: string,
  otp?: string
): Promise<NextResponse> {
  const { status, json } = await railOps(request, '/api/v1/auth/app/login', {
    email,
    password,
    ...(otp ? { otp } : {}),
  });
  if (status === 200 && json?.status === 'MFA_ENROLMENT_REQUIRED') {
    throw new Failure(
      403,
      'Finish setting up two-step sign-in in the RailOps staff app first, then sign in here.',
      'MFA_SETUP_IN_RAILOPS'
    );
  }
  const session = status === 200 ? asSession(json) : null;
  if (!session) throw railOpsFailure(status, json);
  try {
    return signedIn(session, await profile(request, session.accessToken));
  } catch (err) {
    await endQuietly(request, session.refreshToken); // no half-signed-in RailOps session left behind
    throw err;
  }
}

function text(
  body: Record<string, unknown>,
  key: string,
  max = 254
): string | null {
  const v = body[key];
  return typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null;
}

async function handle(
  request: NextRequest,
  action: RailOpsAction,
  body: Record<string, unknown>
): Promise<NextResponse> {
  const cookieToken =
    request.cookies.get(RAILOPS_REFRESH_COOKIE)?.value || null;
  switch (action) {
    case 'login': {
      const email = text(body, 'usernameOrEmail');
      const password = typeof body.password === 'string' ? body.password : '';
      const otp =
        typeof body.otp === 'string' && OTP_PATTERN.test(body.otp)
          ? body.otp
          : undefined;
      if (!email || !password)
        return fail(400, 'Enter your email and password.', 'VALIDATION_ERROR');
      if (!email.includes('@'))
        return fail(400, 'Sign in with your email address.', 'EMAIL_REQUIRED');
      return logIn(request, email, password, otp);
    }
    case 'register': {
      const email = text(body, 'email');
      const phone = text(body, 'phone', 20);
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !phone || !password) {
        return fail(
          400,
          'Email, phone number and password are required.',
          'VALIDATION_ERROR'
        );
      }
      const { status, json } = await railOps(request, '/api/v1/auth/register', {
        email,
        password,
        phone,
      });
      if (status !== 201) throw railOpsFailure(status, json);
      return logIn(request, email, password);
    }
    case 'refresh': {
      if (!cookieToken) return fail(401, 'Not signed in');
      const { status, json } = await railOps(
        request,
        '/api/v1/auth/app/refresh',
        { refreshToken: cookieToken }
      );
      const session = status === 200 ? asSession(json) : null;
      // A failed refresh does NOT clear the cookie (two tabs racing; see authProxy).
      if (!session) throw railOpsFailure(status, json);
      try {
        return signedIn(session, await profile(request, session.accessToken));
      } catch (err) {
        // The old refresh token is already used up: keep the new one, or the next refresh looks like token theft.
        const f =
          err instanceof Failure ? err : new Failure(502, 'Request failed');
        const response = fail(f.status, f.message, f.code);
        setCookie(response, session.refreshToken, session.refreshExpiresIn);
        return response;
      }
    }
    case 'logout': {
      if (cookieToken) await endQuietly(request, cookieToken);
      const done = new NextResponse(null, { status: 204 });
      done.cookies.set(RAILOPS_REFRESH_COOKIE, '', {
        httpOnly: true,
        secure: PRODUCTION,
        sameSite: 'strict',
        path: REFRESH_COOKIE_PATH,
        maxAge: 0,
      });
      return done;
    }
    case 'mfaConfirm':
      return fail(
        404,
        'Two-step sign-in is set up in the RailOps staff app.',
        'MFA_SETUP_IN_RAILOPS'
      );
  }
}

export async function railOpsAuth(
  request: NextRequest,
  action: RailOpsAction
): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return errorBody(403, 'Request not allowed');
  }
  const body = await readJson(request);
  if (body === null) {
    return errorBody(400, 'Request body is missing or not valid JSON');
  }
  try {
    return await handle(request, action, body);
  } catch (err) {
    if (err instanceof Failure) return fail(err.status, err.message, err.code);
    return fail(500, 'Something went wrong. Please try again.');
  }
}
