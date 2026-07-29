import { getJwtExpiryMillis } from './jwt';
import { refreshSession } from '@/services/authService';
import { getSession, setSession } from '@/stores/authStore';

// Refresh a bit before actual expiry so a slow request doesn't race the
// token expiring mid-flight.
const EXPIRY_BUFFER_MS = 30_000;

// Multiple components can call getValidAccessToken() around the same
// time (e.g. AccountClient fetching the profile while something else
// fires); without de-duping, each would try to rotate the same refresh
// token and only the first would win (the backend revokes-on-use - see
// RefreshTokenService.rotate), silently logging the user out. Sharing one
// in-flight promise avoids that.
let inFlightRefresh: Promise<string | null> | null = null;

/**
 * Returns a token that's valid for at least EXPIRY_BUFFER_MS, refreshing
 * it first if the currently stored one is expired or about to be. Returns
 * null if there's no session at all, or if the refresh itself fails
 * (e.g. the refresh token was also expired/revoked) - callers should
 * treat null the same as "not logged in."
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = getSession();
  if (!session) return null;

  const expiry = getJwtExpiryMillis(session.token);
  const stillFresh = expiry != null && expiry - Date.now() > EXPIRY_BUFFER_MS;

  if (stillFresh) {
    return session.token;
  }

  if (!session.refreshToken) {
    // Session was stored before refresh tokens existed (see
    // authStore.ts's migration note) - nothing to refresh with, caller
    // will get a 401 from the backend and should treat that as "logged
    // out."
    return session.token;
  }

  if (!inFlightRefresh) {
    inFlightRefresh = refreshSession({ refreshToken: session.refreshToken })
      .then((response) => {
        setSession({
          token: response.token,
          refreshToken: response.refreshToken,
          username: response.username,
          email: response.email,
        });
        return response.token;
      })
      .catch(() => null)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}
