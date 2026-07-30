import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  AuthSession,
  clearSession,
  getSession,
  setSession,
  useAuthSession,
} from './authStore';

// authStore previously had no test coverage, unlike every sibling
// localStorage-backed store (favoritesStore, recentSearchStore,
// savedJourneyStore, preferencesStore, popularityStore,
// popularSearchStore, adminKeyStore) - flagged in the frontend
// architecture review's Latest Audit Update ("authStore.ts has no test...
// worth a follow-up given it guards login/session state"). This mirrors
// those stores' test shape while also covering the two behaviors unique
// to authStore: the storage-key-scoped `storage` event listener (rather
// than the generic createLocalStorageStore primitive) and the
// backward-compatible handling of sessions persisted before
// `refreshToken` existed.

const session: AuthSession = {
  token: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
  username: 'manish',
  email: 'manish@example.com',
};

describe('authStore', () => {
  beforeEach(() => {
    clearSession();
    window.localStorage.clear();
  });

  it('starts logged out', () => {
    expect(getSession()).toBeNull();
  });

  it('setSession() persists the session and getSession() reads it back', () => {
    setSession(session);

    expect(getSession()).toEqual(session);
  });

  it('clearSession() logs the user out', () => {
    setSession(session);
    clearSession();

    expect(getSession()).toBeNull();
  });

  it('persists to localStorage under the "raillens-auth" key', () => {
    setSession(session);

    const stored = JSON.parse(window.localStorage.getItem('raillens-auth')!);
    expect(stored).toEqual(session);
  });

  it('treats corrupt stored JSON as logged out rather than throwing', () => {
    window.localStorage.setItem('raillens-auth', '{not valid json');

    expect(getSession()).toBeNull();
  });

  it('treats a stored value missing required fields as logged out', () => {
    window.localStorage.setItem(
      'raillens-auth',
      JSON.stringify({ token: 'only-a-token' }),
    );

    expect(getSession()).toBeNull();
  });

  it('backward-compat: a session stored before refreshToken existed is still treated as logged in, with an empty refreshToken', () => {
    window.localStorage.setItem(
      'raillens-auth',
      JSON.stringify({
        token: session.token,
        username: session.username,
        email: session.email,
        // no refreshToken field at all - simulates a session written by
        // an older build of the app.
      }),
    );

    expect(getSession()).toEqual({ ...session, refreshToken: '' });
  });

  it('useAuthSession() re-renders subscribed components when setSession()/clearSession() are called', () => {
    const { result } = renderHook(() => useAuthSession());

    expect(result.current).toBeNull();

    act(() => {
      setSession(session);
    });
    expect(result.current).toEqual(session);

    act(() => {
      clearSession();
    });
    expect(result.current).toBeNull();
  });
});
