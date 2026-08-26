import { getJwtExpiryMillis } from './jwt';
import { refreshSession } from '@/services/authService';
import { getSession, setSession } from '@/stores/authStore';
const EXPIRY_BUFFER_MS = 30000;
let inFlightRefresh: Promise<string | null> | null = null;
export async function getValidAccessToken(): Promise<string | null> {
  const session = getSession();
  if (!session) return null;
  const expiry = getJwtExpiryMillis(session.token);
  const stillFresh = expiry != null && expiry - Date.now() > EXPIRY_BUFFER_MS;
  if (stillFresh) {
    return session.token;
  }
  if (!session.refreshToken) {
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
