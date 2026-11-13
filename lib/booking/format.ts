import { BookingStatus, TravelClass } from '@/types/booking';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export function formatInr(amount: number): string {
  return INR.format(amount);
}

const IST_TIME = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Railway times are Indian time wherever the reader is. */
export function formatIst(iso: string | null | undefined): string {
  return iso ? IST_TIME.format(new Date(iso)) : '—';
}

export const CLASS_NAMES: Record<TravelClass, string> = {
  '1A': 'First AC',
  '2A': 'AC 2-tier',
  '3A': 'AC 3-tier',
  '3E': 'AC 3-tier economy',
  SL: 'Sleeper',
  CC: 'AC chair car',
  EC: 'Executive chair car',
  '2S': 'Second sitting',
};

/** RailOps' AVAILABLE-n / RAC-n / WL-n / REGRET / BOOKING_CLOSED, in words. */
export function availabilityLabel(display: string): {
  text: string;
  tone: 'good' | 'warn' | 'bad';
} {
  const [kind, n] = display.split('-');
  switch (kind) {
    case 'AVAILABLE':
      return { text: `Available ${n}`, tone: 'good' };
    case 'RAC':
      return { text: `RAC ${n}`, tone: 'warn' };
    case 'WL':
      return { text: `Waitlist ${n}`, tone: 'warn' };
    case 'REGRET':
      return { text: 'Full (regret)', tone: 'bad' };
    case 'BOOKING_CLOSED':
      return { text: 'Booking closed', tone: 'bad' };
    default:
      return { text: display, tone: 'warn' };
  }
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Waiting for payment',
  CONFIRMED: 'Booked',
  PARTIALLY_CANCELLED: 'Partly cancelled',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired (not paid in time)',
  FAILED_REFUNDING: 'Failed, refund on its way',
  CHART_CANCELLED: 'Cancelled at chart (waitlisted)',
  RUN_CANCELLED: 'Train cancelled, full refund',
};

/** Tomorrow in India, as YYYY-MM-DD. */
export function tomorrowIst(now: Date = new Date()): string {
  const ist = new Date(now.getTime() + 330 * 60000 + 24 * 3600000);
  return ist.toISOString().slice(0, 10);
}
