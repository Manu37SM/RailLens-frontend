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
 * How RailOps takes payment (Phase 6), matching its PAYMENT_GATEWAY: 'simulated' (default, a button that pretends)
 * or 'razorpay' (Razorpay TEST MODE: the passenger is sent to Razorpay's hosted page and comes back).
 */
export type PaymentMode = 'simulated' | 'razorpay';
export function paymentMode(): PaymentMode {
  return process.env.NEXT_PUBLIC_RAILOPS_PAYMENTS?.trim() === 'razorpay'
    ? 'razorpay'
    : 'simulated';
}

/**
 * Hosts the checkout page may be on (comma-separated, https only). Defaults to Razorpay's link host (rzp.io) in
 * Razorpay mode; nothing otherwise.
 */
export function paymentHosts(): string[] {
  const configured = (process.env.NEXT_PUBLIC_RAILOPS_PAYMENT_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (configured.length) return configured;
  return paymentMode() === 'razorpay' ? ['rzp.io'] : [];
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
