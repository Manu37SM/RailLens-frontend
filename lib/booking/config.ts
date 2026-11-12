import { loginProvider } from '@/lib/loginProvider';

/**
 * Booking (Phase 5) talks to RailOps from the browser with the signed-in person's RailOps access token, so it only
 * exists once sign-in goes through RailOps (Phase 4D) and the RailOps gateway address is known. Both are read at
 * build time.
 */
export function railOpsApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_RAILOPS_API_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

export function bookingEnabled(): boolean {
  return loginProvider() === 'railops' && railOpsApiUrl() !== null;
}

/**
 * Hosts a real payment gateway's checkout may be on (comma-separated, https only). Empty until a real gateway is
 * added; the demo uses RailOps' simulated checkout instead and never redirects.
 */
export function paymentHosts(): string[] {
  return (process.env.NEXT_PUBLIC_RAILOPS_PAYMENT_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/** Only https URLs on an allowed host, without credentials: never send people to a look-alike payment page. */
export function isAllowedCheckoutUrl(
  raw: string,
  hosts: readonly string[] = paymentHosts()
): boolean {
  try {
    const u = new URL(raw);
    return (
      u.protocol === 'https:' &&
      hosts.includes(u.hostname.toLowerCase()) &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
}
