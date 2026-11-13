'use client';
import { useEffect, useState } from 'react';
import { getSeatMap } from '@/services/bookingService';
import { SeatMap, TravelClass } from '@/types/booking';

/** Refresh while the page is open, so berths fill as other people book. */
export const SEAT_MAP_REFRESH_MS = 15000;

export const BERTH_NAMES: Record<string, string> = {
  LB: 'Lower',
  MB: 'Middle',
  UB: 'Upper',
  SL: 'Side lower',
  SU: 'Side upper',
  WS: 'Window',
  MS: 'Middle',
  AS: 'Aisle',
};

const CELL: Record<string, string> = {
  FREE: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700',
  RAC_HALF:
    'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700',
  TAKEN:
    'bg-slate-200 text-slate-400 border-slate-300 line-through dark:bg-slate-700 dark:text-slate-500 dark:border-slate-600',
};

const STATE_WORDS = {
  FREE: 'free',
  RAC_HALF: 'half taken (RAC)',
  TAKEN: 'taken',
} as const;

interface Props {
  runId: number;
  travelClass: TravelClass;
  fromSeq: number;
  toSeq: number;
}

/**
 * Phase 6: which berths are free for this journey, live. RailOps assigns the actual berth when seats are held
 * (honouring each passenger's preference where it can); this map shows how full each coach is right now.
 */
export default function SeatMapView({
  runId,
  travelClass,
  fromSeq,
  toSeq,
}: Props) {
  const [map, setMap] = useState<SeatMap | null>(null);
  const [coach, setCoach] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getSeatMap(runId, travelClass, fromSeq, toSeq)
        .then((m) => {
          if (!alive) return;
          setMap(m);
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, SEAT_MAP_REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [runId, travelClass, fromSeq, toSeq]);

  if (!map) {
    return failed ? (
      <p className="text-sm text-slate-500">
        The seat map isn’t available right now.
      </p>
    ) : null;
  }
  const shown = map.coaches.find((c) => c.label === coach) ?? map.coaches[0];
  if (!shown) return null;

  return (
    <section aria-labelledby="seatmap-heading" className="space-y-3">
      <h2
        id="seatmap-heading"
        className="text-base font-semibold text-slate-900 dark:text-slate-100"
      >
        Seats right now
      </h2>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Coaches">
        {map.coaches.map((c) => (
          <button
            key={c.label}
            type="button"
            role="tab"
            aria-selected={c.label === shown.label}
            onClick={() => setCoach(c.label)}
            className={`rounded-lg border px-3 py-1 text-sm font-medium ${
              c.label === shown.label
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200'
            }`}
          >
            {c.label} · {c.free} free
          </button>
        ))}
      </div>
      <ol
        className="grid grid-cols-8 gap-1 sm:grid-cols-12"
        aria-label={`Coach ${shown.label}`}
      >
        {shown.berths.map((b) => (
          <li
            key={b.no}
            title={`${b.no} ${BERTH_NAMES[b.type] ?? b.type}: ${STATE_WORDS[b.state]}`}
            aria-label={`${shown.label} ${b.no}, ${BERTH_NAMES[b.type] ?? b.type}, ${STATE_WORDS[b.state]}`}
            data-state={b.state}
            className={`flex h-10 flex-col items-center justify-center rounded border text-[11px] leading-tight ${CELL[b.state]}`}
          >
            <span className="font-semibold">{b.no}</span>
            <span>{b.type}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Green free · amber half taken (RAC) · grey taken. Updates every 15
        seconds. RailOps picks the exact berth when it holds your seats, using
        each passenger’s preference where it can. These are RailOps’ own
        bookings, not Indian Railways’.
      </p>
    </section>
  );
}
