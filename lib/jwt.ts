/**
 * Decodes (does NOT verify - that's the backend's job) a JWT's payload to
 * read its `exp` claim, so the frontend can proactively refresh a
 * near-expiry access token instead of waiting for an API call to fail
 * with 401 first. Never trust this for anything security-sensitive; it's
 * purely a client-side UX optimization.
 */
export function getJwtExpiryMillis(token: string): number | null {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { exp?: number };

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
