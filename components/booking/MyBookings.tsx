'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CLASS_NAMES, formatInr, STATUS_LABELS } from '@/lib/booking/format';
import { cardClasses } from '@/lib/formStyles';
import { listBookings } from '@/services/bookingService';
import { ApiError } from '@/services/api';
import { BookingSummary } from '@/types/booking';

export default function MyBookings() {
  const [items, setItems] = useState<BookingSummary[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(next: string | null) {
    setLoading(true);
    setError(null);
    try {
      const page = await listBookings(next);
      setItems((old) => [...(next ? (old ?? []) : []), ...page.items]);
      setCursor(page.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Couldn’t load your bookings.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(null);
  }, []);

  return (
    <div className={cardClasses}>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        My bookings
      </h1>
      {items && items.length === 0 && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          No bookings yet. Open a train’s page and use{' '}
          <strong>Book this train</strong>.
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
          {items.map((b) => (
            <li key={b.pnr}>
              <Link
                href={`/bookings/${b.pnr}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {b.pnr}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {b.runDate} · {CLASS_NAMES[b.classCode] ?? b.classCode} ·{' '}
                    {formatInr(b.totalFare)}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
      {loading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}
      {cursor && !loading && (
        <button
          type="button"
          onClick={() => load(cursor)}
          className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
        >
          Show older bookings
        </button>
      )}
    </div>
  );
}
