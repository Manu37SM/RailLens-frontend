import { ApiError } from './api';
import { reportBackendTrouble } from '@/lib/backendStatus/store';
import { railOpsApiUrl } from '@/lib/booking/config';
import { getValidAccessToken } from '@/lib/sessionRefresh';
import {
  BookingPage,
  BookingView,
  CancellationView,
  CreateBookingRequest,
  PaymentIntent,
  RunAvailability,
  RunSummary,
  SeatMap,
  TravelClass,
} from '@/types/booking';

/**
 * RailOps booking API, called from the browser (Phase 5). Signed-in calls carry the person's RailOps access token,
 * which is the website's own access token once sign-in goes through RailOps (Phase 4D). The RailOps gateway allows
 * this site by CORS. Prices always come from the server; nothing here sends an amount.
 */

/** Switch on RailOps' stable codes, never on its detail text (which is worded for logs). */
const MESSAGES: Record<string, string> = {
  RES_RUN_NOT_FOUND: 'This train isn’t open for booking on that date yet.',
  RES_REGRET: 'No seats or waitlist places are left in this class.',
  RES_ONLY_IF_CNF_UNMET:
    'Confirmed berths aren’t available for everyone, so nothing was booked (you chose “book only if confirmed”).',
  RES_RUN_NOT_BOOKABLE: 'Booking isn’t open for this train right now.',
  RES_HOLD_EXPIRED: 'Your seat hold expired before payment. Please book again.',
  RES_BOOKING_NOT_FOUND: 'We couldn’t find that booking.',
  RES_CANCELLATION_CLOSED: 'Online cancellation is closed for this booking.',
  RES_BOOKING_NOT_PAYABLE: 'This booking can’t be paid for any more.',
  RES_WAITING_ROOM:
    'This train is very busy right now. Please try again in a few minutes.',
  IDEM_KEY_REUSED:
    'This request conflicts with an earlier one. Please reload and try again.',
  IDEM_IN_PROGRESS:
    'Your earlier request is still being processed. Please wait a moment.',
  PAYMENT_UNAVAILABLE:
    'Payments are temporarily unavailable. Your seats are still held; please try again shortly.',
  DEPENDENCY_UNAVAILABLE:
    'A service is temporarily unavailable. Please try again shortly.',
};
/** Codes where RailOps' own detail is the most specific explanation. */
const USE_DETAIL = new Set([
  'RES_QUOTA_INELIGIBLE',
  'RES_INVALID_JOURNEY',
  'RES_INVALID_CANCELLATION',
]);

export function toBookingError(status: number, body: unknown): ApiError {
  const p = (body && typeof body === 'object' ? body : {}) as {
    code?: string;
    detail?: string;
  };
  const code = p.code ?? (status === 429 ? 'TOO_MANY_REQUESTS' : undefined);
  let message = code ? MESSAGES[code] : undefined;
  if (!message && code && USE_DETAIL.has(code) && p.detail) {
    message =
      p.detail.charAt(0).toUpperCase() +
      p.detail.slice(1) +
      (/[.!?]$/.test(p.detail) ? '' : '.');
  }
  if (!message) {
    message =
      status === 401
        ? 'Please log in again.'
        : status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : status >= 500
            ? 'The booking service had a problem. Please try again in a minute.'
            : 'The request couldn’t be completed. Please check the details and try again.';
  }
  return new ApiError(status, message, code);
}

interface CallOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  auth?: boolean;
  idempotencyKey?: string;
}

/** The free RailOps services can take about a minute to wake up. */
const TIMEOUT_MS = 65000;

async function call<T>(path: string, options: CallOptions = {}): Promise<T> {
  const base = railOpsApiUrl();
  if (!base) throw new ApiError(0, 'Booking isn’t available on this site yet.');
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.idempotencyKey)
    headers['Idempotency-Key'] = options.idempotencyKey;
  if (options.auth !== false) {
    const token = await getValidAccessToken();
    if (!token)
      throw new ApiError(401, 'Please log in to book.', 'UNAUTHENTICATED');
    headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    reportBackendTrouble('railops', 0);
    throw new ApiError(
      0,
      'Can’t reach the booking service. Check your connection and try again.'
    );
  }
  reportBackendTrouble('railops', res.status);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw toBookingError(res.status, json);
  return json as T;
}

export function findRun(trainNo: string, date: string): Promise<RunSummary> {
  return call(
    `/api/v1/runs?trainNo=${encodeURIComponent(trainNo)}&date=${encodeURIComponent(date)}`,
    { auth: false }
  );
}

export function getRun(runId: number): Promise<RunSummary> {
  return call(`/api/v1/runs/${runId}`, { auth: false });
}

export function getSeatMap(
  runId: number,
  travelClass: TravelClass,
  fromSeq: number,
  toSeq: number
): Promise<SeatMap> {
  return call(
    `/api/v1/runs/${runId}/seat-map?class=${encodeURIComponent(travelClass)}&from=${fromSeq}&to=${toSeq}`,
    { auth: false }
  );
}

export function getAvailability(
  runId: number,
  fromSeq: number,
  toSeq: number
): Promise<RunAvailability> {
  return call(
    `/api/v1/runs/${runId}/availability?from=${fromSeq}&to=${toSeq}`,
    { auth: false }
  );
}

/** idempotencyKey: one per booking attempt, reused on retry, so a double click or a retry never books twice. */
export function createBooking(
  request: CreateBookingRequest,
  idempotencyKey: string
): Promise<BookingView> {
  return call('/api/v1/bookings', {
    method: 'POST',
    body: request,
    idempotencyKey,
  });
}

export function getBooking(pnr: string): Promise<BookingView> {
  return call(`/api/v1/bookings/${encodeURIComponent(pnr)}`);
}

export function listBookings(cursor?: string | null): Promise<BookingPage> {
  return call(
    `/api/v1/bookings?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
  );
}

/** Demo only: RailOps answers 404 RES_SIMULATED_PAYMENTS_OFF where a real payment gateway is in use. */
export function paySimulated(
  pnr: string,
  outcome: 'SUCCESS' | 'FAILURE'
): Promise<PaymentIntent> {
  return call(`/api/v1/bookings/${encodeURIComponent(pnr)}/simulated-payment`, {
    method: 'POST',
    body: { outcome },
  });
}

export function paymentIntent(pnr: string): Promise<PaymentIntent> {
  return call(`/api/v1/bookings/${encodeURIComponent(pnr)}/payment-intent`, {
    method: 'POST',
  });
}

export function cancellationQuote(pnr: string): Promise<CancellationView> {
  return call(`/api/v1/bookings/${encodeURIComponent(pnr)}/cancellation-quote`);
}

export function cancelBooking(
  pnr: string,
  idempotencyKey: string
): Promise<CancellationView> {
  return call(`/api/v1/bookings/${encodeURIComponent(pnr)}/cancellations`, {
    method: 'POST',
    body: {},
    idempotencyKey,
  });
}

/** 16-64 of [A-Za-z0-9-], as RailOps requires. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
