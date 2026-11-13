import { afterEach, describe, expect, it, vi } from 'vitest';
import { availabilityLabel, tomorrowIst } from './format';
import { bookingEnabled, isAllowedCheckoutUrl } from './config';
import { toBookingError } from '@/services/bookingService';

describe('booking helpers', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('booking needs the RailOps login AND the RailOps address', () => {
    expect(bookingEnabled()).toBe(false);
    vi.stubEnv(
      'NEXT_PUBLIC_RAILOPS_API_URL',
      'https://railops-gateway.example'
    );
    expect(bookingEnabled()).toBe(false);
    vi.stubEnv('NEXT_PUBLIC_RAILLENS_LOGIN_PROVIDER', 'railops');
    expect(bookingEnabled()).toBe(true);
  });

  it('only https checkout pages on allowed hosts, never look-alikes or credentials', () => {
    const hosts = ['checkout.razorpay.com'];
    expect(
      isAllowedCheckoutUrl('https://checkout.razorpay.com/v1/x', hosts)
    ).toBe(true);
    expect(
      isAllowedCheckoutUrl('http://checkout.razorpay.com/v1/x', hosts)
    ).toBe(false);
    expect(
      isAllowedCheckoutUrl('https://checkout.razorpay.com.evil.in/x', hosts)
    ).toBe(false);
    expect(
      isAllowedCheckoutUrl('https://user:pw@checkout.razorpay.com/x', hosts)
    ).toBe(false);
    expect(isAllowedCheckoutUrl('https://pay.example/checkout/1', [])).toBe(
      false
    );
    expect(isAllowedCheckoutUrl('javascript:alert(1)', hosts)).toBe(false);
  });

  it('turns RailOps availability codes into words', () => {
    expect(availabilityLabel('AVAILABLE-12')).toEqual({
      text: 'Available 12',
      tone: 'good',
    });
    expect(availabilityLabel('WL-5')).toEqual({
      text: 'Waitlist 5',
      tone: 'warn',
    });
    expect(availabilityLabel('REGRET').tone).toBe('bad');
    expect(availabilityLabel('BOOKING_CLOSED').tone).toBe('bad');
  });

  it('tomorrow is counted in Indian time', () => {
    // 20:00 UTC on 10 Nov is 01:30 IST on 11 Nov, so tomorrow is 12 Nov.
    expect(tomorrowIst(new Date('2026-11-10T20:00:00Z'))).toBe('2026-11-12');
    expect(tomorrowIst(new Date('2026-11-10T10:00:00Z'))).toBe('2026-11-11');
  });

  it('error messages come from stable codes, not RailOps log text', () => {
    expect(
      toBookingError(409, {
        code: 'RES_REGRET',
        detail: 'pool exhausted for 3A/GN',
      }).message
    ).toMatch(/No seats/);
    expect(
      toBookingError(422, {
        code: 'RES_INVALID_JOURNEY',
        detail: 'from must be before to',
      }).message
    ).toBe('From must be before to.');
    expect(
      toBookingError(500, { code: 'INTERNAL', detail: 'NullPointerException' })
        .message
    ).not.toContain('Null');
    expect(toBookingError(429, null).code).toBe('TOO_MANY_REQUESTS');
  });

  it('Razorpay mode allows only rzp.io unless hosts are configured', () => {
    expect(isAllowedCheckoutUrl('https://rzp.io/i/x')).toBe(false); // simulated mode: nothing allowed
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_PAYMENTS', 'razorpay');
    expect(isAllowedCheckoutUrl('https://rzp.io/i/x')).toBe(true);
    expect(isAllowedCheckoutUrl('https://rzp.io.evil.in/i/x')).toBe(false);
    vi.stubEnv('NEXT_PUBLIC_RAILOPS_PAYMENT_HOSTS', 'pay.example');
    expect(isAllowedCheckoutUrl('https://rzp.io/i/x')).toBe(false);
  });
});
