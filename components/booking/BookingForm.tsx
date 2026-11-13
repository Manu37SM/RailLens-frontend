'use client';
import { SubmitEvent, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { CLASS_NAMES, formatIst } from '@/lib/booking/format';
import SeatMapView, { BERTH_NAMES } from './SeatMapView';
import { stationLabel, useStationNames } from '@/lib/booking/useStationNames';
import { cardClasses, inputClasses, labelClasses } from '@/lib/formStyles';
import {
  createBooking,
  getRun,
  newIdempotencyKey,
} from '@/services/bookingService';
import { ApiError } from '@/services/api';
import { useAuthSession } from '@/stores/authStore';
import { PassengerInput, RunSummary, TravelClass } from '@/types/booking';

const NAME_PATTERN = /^[\p{L} .'-]+$/u;
const PHONE_PATTERN = /^\+?[0-9 -]{10,16}$/;
const CLASSES = new Set<TravelClass>([
  '1A',
  '2A',
  '3A',
  '3E',
  'SL',
  'CC',
  'EC',
  '2S',
]);
const MAX_PASSENGERS = 6;

interface PassengerRow {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'T' | '';
  /** Phase 6: berth or seat type wanted ('' = no preference). RailOps honours it where it can. */
  pref?: string;
}

const EMPTY: PassengerRow = { name: '', age: '', gender: '', pref: '' };
const SEATED = new Set<TravelClass>(['CC', 'EC', '2S']);
export function preferenceOptions(cls: TravelClass): string[] {
  if (SEATED.has(cls)) return cls === 'EC' ? ['WS', 'AS'] : ['WS', 'MS', 'AS'];
  if (cls === '1A') return ['LB', 'UB'];
  // No side lower: RailOps keeps those for RAC passengers, so asking for one could never be met.
  if (cls === '2A') return ['LB', 'UB', 'SU'];
  return ['LB', 'MB', 'UB', 'SU'];
}

/** Reads run, from, to and class from the address, as set by the "Book" buttons on a train page. */
function useJourney() {
  const params = useSearchParams();
  const run = Number(params.get('run'));
  const from = Number(params.get('from'));
  const to = Number(params.get('to'));
  const cls = params.get('class') as TravelClass | null;
  const valid =
    Number.isInteger(run) &&
    run > 0 &&
    Number.isInteger(from) &&
    Number.isInteger(to) &&
    from >= 0 &&
    to > from &&
    cls !== null &&
    CLASSES.has(cls);
  return valid ? { run, from, to, cls: cls as TravelClass } : null;
}

export function validatePassengers(rows: PassengerRow[]): string | null {
  if (rows.length < 1 || rows.length > MAX_PASSENGERS)
    return `Add 1 to ${MAX_PASSENGERS} passengers.`;
  for (const [i, p] of rows.entries()) {
    const n = i + 1;
    if (
      !p.name.trim() ||
      p.name.trim().length > 60 ||
      !NAME_PATTERN.test(p.name.trim())
    )
      return `Passenger ${n}: enter a name using letters only.`;
    const age = Number(p.age);
    if (p.age === '' || !Number.isInteger(age) || age < 0 || age > 125)
      return `Passenger ${n}: enter an age from 0 to 125.`;
    if (!p.gender) return `Passenger ${n}: choose a gender.`;
  }
  return null;
}

export default function BookingForm() {
  const router = useRouter();
  const session = useAuthSession();
  const journey = useJourney();
  const [run, setRun] = useState<RunSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerRow[]>([{ ...EMPTY }]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(session?.email ?? '');
  const [onlyIfConfirmed, setOnlyIfConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One key per booking attempt: a retry after a timeout returns the same booking instead of a second one.
  const attemptKey = useRef<string | null>(null);
  const names = useStationNames(run?.trainNo);

  useEffect(() => {
    if (!journey) return;
    let alive = true;
    getRun(journey.run)
      .then((r) => alive && setRun(r))
      .catch(
        (err) =>
          alive &&
          setLoadError(
            err instanceof ApiError ? err.message : 'Couldn’t load this train.'
          )
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.run]);

  if (!journey) {
    return (
      <div className={cardClasses}>
        <p className="text-slate-700 dark:text-slate-300">
          Start from a train’s page: pick a date and stations, then choose a
          class.
        </p>
      </div>
    );
  }
  if (loadError)
    return (
      <div className={cardClasses}>
        <p role="alert" className="text-red-600 dark:text-red-400">
          {loadError}
        </p>
      </div>
    );
  if (!run)
    return (
      <div className={cardClasses}>
        <p className="text-slate-500">Loading…</p>
      </div>
    );

  const fromStop = run.stops.find((s) => s.seq === journey.from);
  const toStop = run.stops.find((s) => s.seq === journey.to);

  function update(i: number, patch: Partial<PassengerRow>) {
    attemptKey.current = null; // changed details = a new attempt
    setPassengers((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r))
    );
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!journey || !run) return;
    const problem =
      validatePassengers(passengers) ??
      (PHONE_PATTERN.test(phone.trim())
        ? null
        : 'Enter a contact phone number of 10 to 16 digits.');
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    attemptKey.current ??= newIdempotencyKey();
    try {
      const booking = await createBooking(
        {
          trainRunId: run.runId,
          fromStopSeq: journey.from,
          toStopSeq: journey.to,
          travelClass: journey.cls,
          quota: 'GN',
          passengers: passengers.map<PassengerInput>((p) => ({
            name: p.name.trim(),
            age: Number(p.age),
            gender: p.gender as 'M' | 'F' | 'T',
            berthPreference: p.pref || null,
          })),
          onlyIfConfirmed,
          contactPhone: phone.trim(),
          contactEmail: email.trim() || null,
        },
        attemptKey.current
      );
      router.push(`/bookings/${booking.pnr}`);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status >= 400 &&
        err.status < 500 &&
        err.code !== 'IDEM_IN_PROGRESS'
      ) {
        attemptKey.current = null; // refused for good: the next try is a new attempt
      }
      setError(
        err instanceof ApiError
          ? err.message
          : 'Booking failed. Please try again.'
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${cardClasses} space-y-6`} noValidate>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Book train {run.trainNo}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {fromStop ? stationLabel(fromStop.stationCode, names) : '?'} (
          {formatIst(fromStop?.departure)}) →{' '}
          {toStop ? stationLabel(toStop.stationCode, names) : '?'} (
          {formatIst(toStop?.arrival)})
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {CLASS_NAMES[journey.cls]} ({journey.cls}), general quota
        </p>
      </div>

      <SeatMapView
        runId={run.runId}
        travelClass={journey.cls}
        fromSeq={journey.from}
        toSeq={journey.to}
      />

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Passengers
        </legend>
        {passengers.map((p, i) => (
          <div
            key={i}
            className="grid gap-3 sm:grid-cols-[1fr_6rem_8rem_9rem_auto]"
          >
            <div>
              <label htmlFor={`p${i}-name`} className={labelClasses}>
                Name {passengers.length > 1 ? i + 1 : ''}
              </label>
              <input
                id={`p${i}-name`}
                value={p.name}
                maxLength={60}
                autoComplete="name"
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor={`p${i}-age`} className={labelClasses}>
                Age
              </label>
              <input
                id={`p${i}-age`}
                inputMode="numeric"
                value={p.age}
                onChange={(e) =>
                  update(i, {
                    age: e.target.value.replace(/\D/g, '').slice(0, 3),
                  })
                }
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor={`p${i}-gender`} className={labelClasses}>
                Gender
              </label>
              <select
                id={`p${i}-gender`}
                value={p.gender}
                onChange={(e) =>
                  update(i, {
                    gender: e.target.value as PassengerRow['gender'],
                  })
                }
                className={inputClasses}
              >
                <option value="">Choose</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
                <option value="T">Transgender</option>
              </select>
            </div>
            <div>
              <label htmlFor={`p${i}-pref`} className={labelClasses}>
                Preference
              </label>
              <select
                id={`p${i}-pref`}
                value={p.pref ?? ''}
                onChange={(e) => update(i, { pref: e.target.value })}
                className={inputClasses}
              >
                <option value="">Any</option>
                {preferenceOptions(journey.cls).map((t) => (
                  <option key={t} value={t}>
                    {BERTH_NAMES[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {passengers.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove passenger ${i + 1}`}
                  onClick={() =>
                    setPassengers((rows) => rows.filter((_, j) => j !== i))
                  }
                  className="flex h-10 items-center px-2 text-slate-500 hover:text-red-600"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))}
        {passengers.length < MAX_PASSENGERS && (
          <button
            type="button"
            onClick={() => setPassengers((rows) => [...rows, { ...EMPTY }])}
            className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            <Plus size={16} aria-hidden="true" /> Add passenger
          </button>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          Contact for this trip
        </legend>
        <div>
          <label htmlFor="contact-phone" className={labelClasses}>
            Mobile number
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClasses}>
            Email (optional)
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={onlyIfConfirmed}
          onChange={(e) => setOnlyIfConfirmed(e.target.checked)}
        />
        Book only if every passenger gets a confirmed berth
      </label>

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto sm:px-6"
        >
          {submitting ? 'Holding seats…' : 'Hold seats for 10 minutes'}
        </button>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          You’ll see the fare and pay on the next page. Seats are held for 10
          minutes.
        </p>
      </div>
    </form>
  );
}
