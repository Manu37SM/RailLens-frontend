export function getJwtExpiryMillis(token: string): number | null {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) return null;
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as {
      exp?: number;
    };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
