'use client';
import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { bookingEnabled } from '@/lib/booking/config';
import {
  availabilityLabel,
  CLASS_NAMES,
  tomorrowIst,
} from '@/lib/booking/format';
import { cardClasses, inputClasses, labelClasses } from '@/lib/formStyles';
import { findRun, getAvailability } from '@/services/bookingService';
import { ApiError } from '@/services/api';
import { useAuthSession } from '@/stores/authStore';
import { RouteStopResponse } from '@/types/train';
import { PoolAvailability, RunSummary } from '@/types/booking';

interface Props {
  trainNumber: string;
  route: RouteStopResponse[];
}

const TONE: Record<'good' | 'warn' | 'bad', string> = {
  good: 'text-emerald-700 dark:text-emerald-400',
  warn: 'text-amber-700 dark:text-amber-400',
  bad: 'text-red-700 dark:text-red-400',
};

interface Result {
  run: RunSummary;
  fromSeq: number;
  toSeq: number;
  pools: PoolAvailability[];
}

/** Phase 5: check seats on a date and start a booking. Shown only when booking is switched on (lib/booking/config). */
export default function BookTrainCard({ trainNumber, route }: Props) {
  const session = useAuthSession();
  const [date, setDate] = useState(tomorrowIst);
  // Today in India: booking for a past date makes no sense.
  const [minDate] = useState(() =>
    tomorrowIst(new Date(Date.now() - 86400000))
  );
  const [from, setFrom] = useState(route[0]?.stationCode ?? '');
  const [to, setTo] = useState(route[route.length - 1]?.stationCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  if (!bookingEnabled() || route.length < 2) return null;

  async function check(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    const fromIdx = route.findIndex((s) => s.stationCode === from);
    const toIdx = route.findIndex((s) => s.stationCode === to);
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) {
      setError('Choose a boarding station before the destination.');
      return;
    }
    setBusy(true);
    try {
      const run = await findRun(trainNumber, date);
      const fromStop = run.stops.find((s) => s.stationCode === from);
      const toStop = run.stops.find((s) => s.stationCode === to);
      if (!fromStop || !toStop || fromStop.seq >= toStop.seq) {
        setError('This train doesn’t sell tickets between those two stations.');
        return;
      }
      const availability = await getAvailability(
        run.runId,
        fromStop.seq,
        toStop.seq
      );
      setResult({
        run,
        fromSeq: fromStop.seq,
        toSeq: toStop.seq,
        pools: availability.pools.filter((p) => p.quotaCode === 'GN'),
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Couldn’t check seats. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${cardClasses} mt-5`} aria-labelledby="book-heading">
      <h2
        id="book-heading"
        className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"
      >
        <Ticket size={18} aria-hidden="true" />
        Book this train
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Demo booking: payment is simulated and no money moves.
      </p>

      <form
        onSubmit={check}
        className="mt-4 grid gap-4 sm:grid-cols-4"
        noValidate
      >
        <div>
          <label htmlFor="book-date" className={labelClasses}>
            Date
          </label>
          <input
            id="book-date"
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="book-from" className={labelClasses}>
            From
          </label>
          <select
            id="book-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClasses}
          >
            {route.slice(0, -1).map((s) => (
              <option key={s.sequenceNo} value={s.stationCode}>
                {s.stationName} ({s.stationCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="book-to" className={labelClasses}>
            To
          </label>
          <select
            id="book-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClasses}
          >
            {route.slice(1).map((s) => (
              <option key={s.sequenceNo} value={s.stationCode}>
                {s.stationName} ({s.stationCode})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {busy ? 'Checking…' : 'Check seats'}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5">
          {result.pools.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No classes are on sale for this journey.
            </p>
          ) : (
            <ul
              className="divide-y divide-slate-200 dark:divide-slate-700"
              aria-label="Seats by class"
            >
              {result.pools.map((p) => {
                const label = availabilityLabel(p.display);
                const bookable = label.tone !== 'bad';
                const href = `/book?run=${result.run.runId}&from=${result.fromSeq}&to=${result.toSeq}&class=${p.classCode}`;
                return (
                  <li
                    key={p.classCode}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {CLASS_NAMES[p.classCode] ?? p.classCode}{' '}
                        <span className="text-slate-500">({p.classCode})</span>
                      </p>
                      <p className={`text-sm font-medium ${TONE[label.tone]}`}>
                        {label.text}
                      </p>
                    </div>
                    {bookable &&
                      (session ? (
                        <Link
                          href={href}
                          className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700"
                        >
                          Book
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        >
                          Log in to book
                        </Link>
                      ))}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
