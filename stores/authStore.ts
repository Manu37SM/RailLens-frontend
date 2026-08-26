import { useSyncExternalStore } from 'react';
const STORAGE_KEY = 'raillens-auth';
export interface AuthSession {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
}
function parseStoredSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.token === 'string' &&
      (parsed?.refreshToken === undefined ||
        typeof parsed.refreshToken === 'string') &&
      typeof parsed?.username === 'string' &&
      typeof parsed?.email === 'string'
    ) {
      return { ...parsed, refreshToken: parsed.refreshToken ?? '' };
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  cachedSession = session;
  notify();
}
export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  cachedSession = null;
  notify();
}
export function useAuthSession(): AuthSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function getSession(): AuthSession | null {
  return readStoredSession();
}
