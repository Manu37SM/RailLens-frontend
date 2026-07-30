/**
 * Client-side session state for the login/register system. Mirrors the
 * useSyncExternalStore + localStorage pattern already used by lib/theme.ts
 * and stores/recentSearchStore.ts, rather than pulling in a state
 * management library for what's fundamentally "remember one small object
 * and re-render when it changes, including across tabs."
 *
 * Storing the JWT in localStorage (not an httpOnly cookie) is a deliberate
 * trade-off, not an oversight: this app has no server-rendered pages that
 * need the token, nothing here is sensitive enough to justify the
 * CSRF-handling complexity a cookie-based flow would add, and it keeps the
 * token handling symmetric with how every other API call already works
 * (explicit Authorization header, set by the caller). The real exposure is
 * XSS - if that ever becomes a concern for this app, moving to an httpOnly
 * cookie set by the backend is the fix, not obfuscating the storage here.
 */
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
      // refreshToken is missing on sessions stored before this field
      // existed - treat those as still logged in (the access token is
      // still checked for expiry as normal) but without refresh
      // capability until the next login, rather than force-logging
      // everyone out the moment this shipped.
      (parsed?.refreshToken === undefined || typeof parsed.refreshToken === 'string') &&
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

// useSyncExternalStore requires getSnapshot() to return a STABLE reference
// when nothing has actually changed - it compares consecutive results with
// Object.is() to decide whether to re-render. The previous version called
// readStoredSession() (which does JSON.parse + spreads into a new object)
// directly from getSnapshot(), so it returned a brand-new object on every
// single call, including the calls React makes just to double-check after
// a render. React reads that as "the store changed again," re-renders,
// calls getSnapshot() again, gets yet another new object, and loops -
// exactly the "Maximum update depth exceeded" / "getSnapshot should be
// cached" errors seen on the register page. Every other store in this
// codebase (createLocalStorageStore) avoids this by caching a snapshot at
// module scope and only replacing it when the underlying data actually
// changes - mirrored here.
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

  // Hydrate from localStorage after mounting, same pattern/reasoning as
  // createLocalStorageStore: the server snapshot is always null (no
  // access to localStorage during SSR), so the real value has to be read
  // once the component has mounted on the client. queueMicrotask defers
  // the notify so this doesn't try to setState synchronously during
  // React's render/subscribe phase.
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

// Non-reactive read for use outside components (e.g. lib/sessionRefresh.ts)
// where a hook can't be called. Deliberately NOT wired through the cached
// snapshot above - this always re-reads localStorage directly, since
// callers here aren't part of React's render loop and want the current
// value, not a memoized one.
export function getSession(): AuthSession | null {
  return readStoredSession();
}
