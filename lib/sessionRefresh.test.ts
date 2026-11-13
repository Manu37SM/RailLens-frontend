import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import {
  clearSession,
  getAccessToken,
  getSession,
  signIn,
} from '@/stores/authStore';
const refreshSession = vi.fn();
vi.mock('@/services/authService', () => ({
  refreshSession: (...a: unknown[]) => refreshSession(...a),
}));
import { getValidAccessToken } from './sessionRefresh';
function jwt(expSecondsFromNow: number) {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow })
  );
  return `h.${payload}.s`;
}
const profile = {
  username: 'manish',
  email: 'm@example.com',
  role: 'USER' as const,
};
describe('getValidAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    clearSession();
    window.localStorage.clear();
  });
  it('signed out: null, no network call', async () => {
    expect(await getValidAccessToken()).toBeNull();
    expect(refreshSession).not.toHaveBeenCalled();
  });
  it('a fresh in-memory token is used as is', async () => {
    const token = jwt(600);
    signIn({ ...profile, token });
    expect(await getValidAccessToken()).toBe(token);
    expect(refreshSession).not.toHaveBeenCalled();
  });
  it('after a page load (no token in memory) it refreshes through the cookie', async () => {
    window.localStorage.setItem('raillens-auth', JSON.stringify(profile));
    const token = jwt(600);
    refreshSession.mockResolvedValue({ ...profile, token, refreshToken: null });
    expect(await getValidAccessToken()).toBe(token);
    expect(refreshSession).toHaveBeenCalledWith({});
    expect(getAccessToken()).toBe(token);
  });
  it('moves a pre-2B refresh token into the cookie on the first refresh', async () => {
    window.localStorage.setItem(
      'raillens-auth',
      JSON.stringify({ ...profile, token: 'old', refreshToken: 'legacy' })
    );
    refreshSession.mockResolvedValue({
      ...profile,
      token: jwt(600),
      refreshToken: null,
    });
    await getValidAccessToken();
    expect(refreshSession).toHaveBeenCalledWith({ refreshToken: 'legacy' });
    expect(window.localStorage.getItem('raillens-auth')).not.toContain(
      'legacy'
    );
  });
  it('concurrent callers share one refresh', async () => {
    window.localStorage.setItem('raillens-auth', JSON.stringify(profile));
    refreshSession.mockResolvedValue({
      ...profile,
      token: jwt(600),
      refreshToken: null,
    });
    await Promise.all([
      getValidAccessToken(),
      getValidAccessToken(),
      getValidAccessToken(),
    ]);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });
  it('a 401 is retried once (another tab may have just rotated the cookie)', async () => {
    window.localStorage.setItem('raillens-auth', JSON.stringify(profile));
    const token = jwt(600);
    refreshSession
      .mockRejectedValueOnce(
        new ApiError(401, 'Invalid or expired refresh token')
      )
      .mockResolvedValueOnce({ ...profile, token, refreshToken: null });
    expect(await getValidAccessToken()).toBe(token);
    expect(refreshSession).toHaveBeenCalledTimes(2);
  });
  it('two 401s sign the user out', async () => {
    window.localStorage.setItem('raillens-auth', JSON.stringify(profile));
    refreshSession.mockRejectedValue(
      new ApiError(401, 'Invalid or expired refresh token')
    );
    expect(await getValidAccessToken()).toBeNull();
    expect(getSession()).toBeNull();
  });
  it('a network failure keeps the user signed in', async () => {
    window.localStorage.setItem('raillens-auth', JSON.stringify(profile));
    refreshSession.mockRejectedValue(
      new ApiError(0, 'Unable to reach the server.')
    );
    expect(await getValidAccessToken()).toBeNull();
    expect(getSession()).toEqual(profile);
  });
});
