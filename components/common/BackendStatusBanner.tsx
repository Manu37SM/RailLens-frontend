'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Loader2, ServerCrash, X } from 'lucide-react';
import {
  BackendService,
  BackendStatusStore,
  backendStatus,
  ServiceStatus,
  StatusSnapshot,
} from '@/lib/backendStatus/store';

const NAMES: Record<BackendService, string> = {
  raillens: 'RailLens',
  railops: 'Booking (RailOps)',
};

const SERVER_SNAPSHOT: StatusSnapshot = {
  raillens: { phase: 'ok', since: 0, expectedBy: 0 },
  railops: { phase: 'ok', since: 0, expectedBy: 0 },
};

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Shows, for each backend, whether it is waking up (with a countdown), down, or back. Lives in the root layout. */
export default function BackendStatusBanner({
  store,
}: {
  /** For tests; the page-wide store otherwise. */
  store?: BackendStatusStore;
}) {
  const s = store ?? (typeof window === 'undefined' ? null : backendStatus());
  const snapshot = useSyncExternalStore(
    s ? s.subscribe : noopSubscribe,
    s ? s.getSnapshot : () => SERVER_SNAPSHOT,
    () => SERVER_SNAPSHOT
  );
  const waking = Object.values(snapshot).some((x) => x.phase === 'waking');
  const now = useNow(waking);
  useCheckOnReturn(s);

  const rows = (Object.keys(snapshot) as BackendService[]).filter(
    (k) => snapshot[k].phase !== 'ok'
  );
  if (!s || rows.length === 0) return null;

  return (
    <div className="sticky top-0 z-40" role="status" aria-live="polite">
      {rows.map((service) => (
        <Row
          key={service}
          service={service}
          status={snapshot[service]}
          now={now}
          onRecheck={() => s.recheck(service)}
          onDismiss={() => s.dismiss(service)}
        />
      ))}
    </div>
  );
}

function Row({
  service,
  status,
  now,
  onRecheck,
  onDismiss,
}: {
  service: BackendService;
  status: ServiceStatus;
  now: number;
  onRecheck: () => void;
  onDismiss: () => void;
}) {
  const name = NAMES[service];
  if (status.phase === 'waking') {
    const left = status.expectedBy - now;
    return (
      <Bar tone="amber" testId={`backend-status-${service}`}>
        <Loader2 size={18} className="shrink-0 animate-spin" aria-hidden />
        <span className="flex-1">
          <strong>{name} is waking up.</strong> The free server sleeps when
          nobody is using it.{' '}
          {left > 0 ? (
            <>
              Ready in about <strong>{formatCountdown(left)}</strong>, then try
              again.
            </>
          ) : (
            <>Taking a little longer than usual, still starting…</>
          )}
        </span>
      </Bar>
    );
  }
  if (status.phase === 'down') {
    return (
      <Bar tone="red" testId={`backend-status-${service}`}>
        <ServerCrash size={18} className="shrink-0" aria-hidden />
        <span className="flex-1">
          <strong>{name} is down right now.</strong> The server crashed or is
          restarting. Please try again later.
        </span>
        <BarButton onClick={onRecheck}>Check now</BarButton>
        <Close onClick={onDismiss} />
      </Bar>
    );
  }
  return (
    <Bar tone="green" testId={`backend-status-${service}`}>
      <CheckCircle2 size={18} className="shrink-0" aria-hidden />
      <span className="flex-1">
        <strong>{name} is back.</strong> Please try again.
      </span>
      <BarButton onClick={() => window.location.reload()}>Try again</BarButton>
      <Close onClick={onDismiss} />
    </Bar>
  );
}

const TONES = {
  amber:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
  red: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
  green:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
} as const;

function Bar({
  tone,
  testId,
  children,
}: {
  tone: keyof typeof TONES;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className={`flex items-center gap-3 border-b px-4 py-2 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

function BarButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-current px-3 py-1 text-xs font-semibold"
    >
      {children}
    </button>
  );
}

function Close({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="rounded p-1 opacity-70 hover:opacity-100"
    >
      <X size={16} aria-hidden />
    </button>
  );
}

/** Away from the tab at least this long: check RailLens quietly on return (it may have slept or crashed). */
export const RETURN_CHECK_AFTER_MS = 2 * 60 * 1000;

/**
 * Covers "it went down while I was reading": no polling in the background (that would keep the free backend awake
 * and use up its hours), just one quiet check when the visitor comes back after a while. Silent if all is well.
 */
function useCheckOnReturn(store: BackendStatusStore | null) {
  useEffect(() => {
    if (!store) return;
    let hiddenAt: number | null = null;
    const onChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
      } else if (
        hiddenAt !== null &&
        Date.now() - hiddenAt >= RETURN_CHECK_AFTER_MS
      ) {
        hiddenAt = null;
        void store.suspect('raillens');
      }
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [store]);
}

function noopSubscribe() {
  return () => {};
}

/** Current time, ticking every second only while a countdown is on screen. */
function useNow(ticking: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!ticking) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [ticking]);
  return now;
}
