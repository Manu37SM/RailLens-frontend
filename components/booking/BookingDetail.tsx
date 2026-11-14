'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CLASS_NAMES,
  formatInr,
  formatIst,
  STATUS_LABELS,
} from '@/lib/booking/format';
import { isAllowedCheckoutUrl, paymentMode } from '@/lib/booking/config';
import { stationLabel, useStationNames } from '@/lib/booking/useStationNames';
import { cardClasses } from '@/lib/formStyles';
import {
  cancelBooking,
  cancellationQuote,
  getBooking,
  getRun,
  newIdempotencyKey,
  paymentIntent,
  paySimulated,
} from '@/services/bookingService';
import { ApiError } from '@/services/api';
import { BookingView, CancellationView, RunSummary } from '@/types/booking';

/** After paying, the status changes a few seconds later (payment → event → booking). Poll this long, then stop. */
export const POLL_INTERVAL_MS = 2000;
export const POLL_LIMIT = 20;

const buttonClasses =
  'flex h-10 items-center justify-center rounded-lg px-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-slate-400';

function useCountdown(until: string | null | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  if (!until) return null;
  return Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
}

export default function BookingDetail({ pnr }: { pnr: string }) {
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [run, setRun] = useState<RunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [quote, setQuote] = useState<CancellationView | null>(null);
  const cancelKey = useRef<string | null>(null);
  const names = useStationNames(run?.trainNo);
  const secondsLeft = useCountdown(
    booking?.status === 'PENDING_PAYMENT' ? booking.holdExpiresAt : null
  );

  const load = useCallback(async () => {
    const b = await getBooking(pnr);
    setBooking(b);
    return b;
  }, [pnr]);

  // Back from Razorpay's page (?razorpay_payment_link_status=paid): the booking turns Booked once the webhook lands.
  const returnedPaid = useRef<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    returnedPaid.current ??=
      new URLSearchParams(window.location.search).get(
        'razorpay_payment_link_status'
      ) === 'paid';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading on open, same as the account page
    load()
      .then((b) => {
        if (returnedPaid.current && b.status === 'PENDING_PAYMENT') {
          returnedPaid.current = false;
          void waitForStatusChange();
        }
        return getRun(b.trainRunId);
      })
      .then((r) => alive && setRun(r))
      .catch(
        (err) =>
          alive &&
          setError(
            err instanceof ApiError
              ? err.message
              : 'Couldn’t load this booking.'
          )
      );
    return () => {
      alive = false;
    };
  }, [load]);

  async function waitForStatusChange() {
    setWaiting(true);
    try {
      for (let i = 0; i < POLL_LIMIT; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const b = await load();
        if (b.status !== 'PENDING_PAYMENT') return;
      }
      setError(
        'Payment is taking longer than usual. This page will show the result once it arrives; refresh in a minute.'
      );
    } finally {
      setWaiting(false);
    }
  }

  async function pay(outcome: 'SUCCESS' | 'FAILURE') {
    setError(null);
    setBusy(true);
    try {
      if (paymentMode() === 'razorpay') {
        await payAtGateway();
        return;
      }
      await paySimulated(pnr, outcome);
      if (outcome === 'FAILURE') {
        // A failed payment doesn't change the booking: RailOps keeps the seats held so the passenger can retry.
        // Waiting for a status change here would time out with a misleading "taking longer" message.
        await load();
        setError(
          'The payment failed (simulated). Your seats are still held: you can pay again before the hold runs out.'
        );
        return;
      }
      await waitForStatusChange();
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.code === 'RES_SIMULATED_PAYMENTS_OFF'
      ) {
        await payAtGateway();
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Payment didn’t start. Please try again.'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  /** A real payment gateway (not in the demo): go to its checkout, but only on an allow-listed https host. */
  async function payAtGateway() {
    const intent = await paymentIntent(pnr);
    if (!isAllowedCheckoutUrl(intent.checkoutUrl)) {
      setError(
        'The payment page address looked wrong, so we didn’t open it. Please contact support.'
      );
      return;
    }
    window.location.assign(intent.checkoutUrl);
  }

  async function showCancel() {
    setError(null);
    setBusy(true);
    try {
      setQuote(await cancellationQuote(pnr));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Couldn’t check the refund. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancel() {
    setError(null);
    setBusy(true);
    cancelKey.current ??= newIdempotencyKey(); // a retry never asks for a second refund
    try {
      await cancelBooking(pnr, cancelKey.current);
      setQuote(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Cancellation failed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (!booking) {
    return (
      <div className={cardClasses}>
        {error ? (
          <p role="alert" className="text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <p className="text-slate-500">Loading…</p>
        )}
      </div>
    );
  }

  const fromStop = run?.stops.find((s) => s.seq === booking.fromSeq);
  const toStop = run?.stops.find((s) => s.seq === booking.toSeq);
  const payable =
    booking.status === 'PENDING_PAYMENT' && (secondsLeft ?? 1) > 0;
  const cancellable = [
    'PENDING_PAYMENT',
    'CONFIRMED',
    'PARTIALLY_CANCELLED',
  ].includes(booking.status);

  return (
    <div className={`${cardClasses} space-y-6`}>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">PNR</p>
        <h1 className="font-mono text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-100">
          {booking.pnr}
        </h1>
        <p
          className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200"
          data-testid="booking-status"
        >
          {STATUS_LABELS[booking.status] ?? booking.status}
        </p>
      </div>

      <div className="text-sm text-slate-700 dark:text-slate-300">
        <p>
          Train {run?.trainNo ?? '…'} on {booking.runDate}
        </p>
        {fromStop && toStop && (
          <p>
            {stationLabel(fromStop.stationCode, names)} (
            {formatIst(fromStop.departure)}) →{' '}
            {stationLabel(toStop.stationCode, names)} (
            {formatIst(toStop.arrival)})
          </p>
        )}
        <p>
          {CLASS_NAMES[booking.classCode] ?? booking.classCode} (
          {booking.classCode})
        </p>
        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          Fare {formatInr(booking.totalFare)}
        </p>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-1 font-medium">Passenger</th>
            <th className="py-1 font-medium">Age</th>
            <th className="py-1 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-slate-800 dark:text-slate-200">
          {booking.passengers.map((p) => (
            <tr
              key={p.seqNo}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.age}</td>
              <td className="py-2 font-mono">{p.currentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {payable && (
        <div className="space-y-3 rounded-lg bg-orange-50 p-4 dark:bg-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Seats held for{' '}
            <strong>
              {Math.floor((secondsLeft ?? 0) / 60)}:
              {String((secondsLeft ?? 0) % 60).padStart(2, '0')}
            </strong>
            .{' '}
            {paymentMode() === 'razorpay' ? (
              <>
                You’ll pay on Razorpay’s page in <strong>test mode</strong>: use
                a test card or UPI ID. No real money moves.
              </>
            ) : (
              <>
                This is a demo: the payment is <strong>simulated</strong> and no
                money moves.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || waiting}
              onClick={() => pay('SUCCESS')}
              className={`${buttonClasses} bg-orange-600 text-white hover:bg-orange-700`}
            >
              {waiting
                ? 'Confirming…'
                : paymentMode() === 'razorpay'
                  ? `Pay ${formatInr(booking.totalFare)} on Razorpay (test mode)`
                  : `Pay ${formatInr(booking.totalFare)} (simulated)`}
            </button>
            {paymentMode() === 'simulated' && (
              <button
                type="button"
                disabled={busy || waiting}
                onClick={() => pay('FAILURE')}
                className={`${buttonClasses} border border-slate-300 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700`}
              >
                Try a failed payment
              </button>
            )}
          </div>
        </div>
      )}

      {booking.status === 'PENDING_PAYMENT' && !payable && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          The seat hold has run out.{' '}
          <Link
            href={`/trains/${run?.trainNo ?? ''}`}
            className="font-medium text-orange-600"
          >
            Book again
          </Link>
          .
        </p>
      )}

      {cancellable && !quote && (
        <button
          type="button"
          disabled={busy || waiting}
          onClick={showCancel}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Cancel booking…
        </button>
      )}

      {quote && (
        <div className="space-y-3 rounded-lg border border-red-200 p-4 dark:border-red-900">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Cancel the whole booking? Paid {formatInr(quote.totalPaid)}, charge{' '}
            {formatInr(quote.totalCharge)},{' '}
            <strong>refund {formatInr(quote.refundAmount)}</strong> (simulated).
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={confirmCancel}
              className={`${buttonClasses} bg-red-600 text-white hover:bg-red-700`}
            >
              {busy ? 'Cancelling…' : 'Yes, cancel'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setQuote(null)}
              className={`${buttonClasses} border border-slate-300 text-slate-700 dark:text-slate-200`}
            >
              Keep it
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <Link
        href="/bookings"
        className="inline-block text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
      >
        ← My bookings
      </Link>
    </div>
  );
}
