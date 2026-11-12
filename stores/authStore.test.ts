import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AuthSession,
  clearSession,
  getAccessToken,
  getSession,
  peekLegacyRefreshToken,
  sessionFromResponse,
  setSession,
  signIn,
  useAuthSession,
} from './authStore';
const session: AuthSession = {
  username: 'manish',
  email: 'manish@example.com',
  role: 'USER',
};
const response = {
  token: 'access-token-abc',
  username: 'manish',
  email: 'manish@example.com',
  role: 'USER' as const,
};
describe('authStore', () => {
  beforeEach(() => {
    clearSession();
    window.localStorage.clear();
  });
  it('starts logged out', () => {
    expect(getSession()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
  it('signIn() keeps the access token in memory only, and persists just the profile', () => {
    signIn(response);
    expect(getAccessToken()).toBe('access-token-abc');
    expect(getSession()).toEqual(session);
    const stored = window.localStorage.getItem('raillens-auth')!;
    expect(JSON.parse(stored)).toEqual(session);
    expect(stored).not.toContain('access-token-abc');
  });
  it('setSession() never writes tokens even if given extra fields', () => {
    setSession({ ...session, token: 'x', refreshToken: 'y' } as AuthSession);
    const stored = window.localStorage.getItem('raillens-auth')!;
    expect(stored).not.toContain('"token"');
    expect(stored).not.toContain('refreshToken');
  });
  it('clearSession() logs the user out and forgets the access token', () => {
    signIn(response);
    clearSession();
    expect(getSession()).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
  it('treats corrupt stored JSON as logged out rather than throwing', () => {
    window.localStorage.setItem('raillens-auth', '{not valid json');
    expect(getSession()).toBeNull();
  });
  it('treats a stored value missing required fields as logged out', () => {
    window.localStorage.setItem(
      'raillens-auth',
      JSON.stringify({ token: 'only-a-token' })
    );
    expect(getSession()).toBeNull();
  });
  it('a pre-2B session (tokens in storage) still counts as signed in, and its refresh token is offered for migration once', () => {
    window.localStorage.setItem(
      'raillens-auth',
      JSON.stringify({
        token: 'old',
        refreshToken: 'legacy-refresh',
        username: 'manish',
        email: 'manish@example.com',
      })
    );
    expect(getSession()).toEqual({
      username: 'manish',
      email: 'manish@example.com',
    });
    expect(peekLegacyRefreshToken()).toBe('legacy-refresh');
    signIn(response); // after the proxy moved it into the cookie
    expect(peekLegacyRefreshToken()).toBeNull();
  });
  it('sessionFromResponse() keeps ADMIN and treats anything else (or an older server) as USER', () => {
    expect(sessionFromResponse({ ...response, role: 'ADMIN' }).role).toBe(
      'ADMIN'
    );
    expect(
      sessionFromResponse({ token: null, username: 'u', email: 'e' }).role
    ).toBe('USER');
  });
  it('useAuthSession() re-renders subscribed components on sign-in and sign-out', () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current).toBeNull();
    act(() => signIn(response));
    expect(result.current).toEqual(session);
    act(() => clearSession());
    expect(result.current).toBeNull();
  });
});
