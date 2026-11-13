import { getJwtExpiryMillis } from './jwt';
import { refreshSession } from '@/services/authService';
import { ApiError } from '@/services/api';
import {
  clearSession,
  getAccessToken,
  getSession,
  peekLegacyRefreshToken,
  signIn,
} from '@/stores/authStore';
const EXPIRY_BUFFER_MS = 30000;
/** Two tabs refreshing at once: the loser presented the cookie just before the winner replaced it. */
const RACE_RETRY_DELAY_MS = 1000;
let inFlightRefresh: Promise<string | null> | null = null;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function refreshViaCookie(): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const legacy = attempt === 0 ? peekLegacyRefreshToken() : null;
    try {
      const response = await refreshSession(
        legacy ? { refreshToken: legacy } : {}
      );
      signIn(response); // role is re-read by the server on every refresh
      return response.token;
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        return null; // offline or server asleep: stay signed in, try again next time
      }
      if (attempt === 0) {
        await sleep(RACE_RETRY_DELAY_MS);
        continue;
      }
    }
  }
  clearSession(); // the server says this session is over
  return null;
}
/**
 * A usable access token for API calls, or null when signed out. The token is kept only in memory, so after a page
 * load (or when it is about to expire) a new one is fetched through the HttpOnly refresh cookie.
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (!getSession()) return null;
  const token = getAccessToken();
  const expiry = token ? getJwtExpiryMillis(token) : null;
  if (token && expiry != null && expiry - Date.now() > EXPIRY_BUFFER_MS) {
    return token;
  }
  if (!inFlightRefresh) {
    inFlightRefresh = refreshViaCookie().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}
