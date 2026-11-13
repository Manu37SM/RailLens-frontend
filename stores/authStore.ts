import { useSyncExternalStore } from 'react';
const STORAGE_KEY = 'raillens-auth';
/**
 * Who is signed in, for the UI. Deliberately no tokens: the refresh token lives in an HttpOnly cookie that page
 * scripts can't read (set by app/api/auth/*), and the short-lived access token only in memory (see accessToken).
 * role only decides which screens to show; the API enforces access.
 */
export interface AuthSession {
  username: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}
interface SignInResponse {
  token: string | null;
  username: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}
export function sessionFromResponse(response: SignInResponse): AuthSession {
  return {
    username: response.username,
    email: response.email,
    role: response.role === 'ADMIN' ? 'ADMIN' : 'USER',
  };
}
function parseStoredSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.username === 'string' &&
      typeof parsed?.email === 'string'
    ) {
      return {
        username: parsed.username,
        email: parsed.email,
        ...(parsed.role === 'ADMIN' || parsed.role === 'USER'
          ? { role: parsed.role }
          : {}),
      };
    }
    return null;
  } catch {
    return null;
  }
}
function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  return parseStoredSession(window.localStorage.getItem(STORAGE_KEY));
}
/**
 * Versions before Phase 2B kept the refresh token in localStorage. The first refresh hands it to the sign-in proxy
 * once, which moves it into the cookie (users stay signed in); signIn() then rewrites storage without it.
 */
export function peekLegacyRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null'
    );
    return typeof parsed?.refreshToken === 'string' && parsed.refreshToken
      ? parsed.refreshToken
      : null;
  } catch {
    return null;
  }
}
let accessToken: string | null = null;
export function getAccessToken(): string | null {
  return accessToken;
}
export function setAccessToken(token: string | null) {
  accessToken = token;
}
let cachedSession: AuthSession | null = null;
let initialized = false;
function getSnapshot(): AuthSession | null {
  return cachedSession;
}
function getServerSnapshot(): AuthSession | null {
  return null;
}
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  if (!initialized) {
    initialized = true;
    const next = readStoredSession();
    if (JSON.stringify(next) !== JSON.stringify(cachedSession)) {
      cachedSession = next;
      queueMicrotask(notify);
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cachedSession = readStoredSession();
      if (!cachedSession) accessToken = null; // signed out in another tab
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}
function notify() {
  listeners.forEach((listener) => listener());
}
export function setSession(session: AuthSession) {
  const clean = sessionFromResponse({ ...session, token: null });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  cachedSession = clean;
  notify();
}
/** After login/register/refresh/MFA confirm: remember who it is and keep the access token in memory. */
export function signIn(response: SignInResponse) {
  accessToken = response.token;
  setSession(sessionFromResponse(response));
}
export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  accessToken = null;
  cachedSession = null;
  notify();
}
export function useAuthSession(): AuthSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function getSession(): AuthSession | null {
  return readStoredSession();
}
