/**
 * What the visitor should be told when a backend can't be reached, shared by every page (the banner in the layout
 * renders it). Requests report trouble here; this store then asks /api/backend-status every few seconds until the
 * backend answers, and moves through:
 *
 *   ok -> waking -> ready          a sleeping free server starting up (countdown to the expected time)
 *   ok -> waking -> down -> ready  crashed / out of memory / restarting, or still not up after GIVE_UP_MS
 *
 * "ready" stays until the visitor retries or closes it: what they were doing failed and needs doing again.
 */
export type BackendService = 'raillens' | 'railops';
export type Phase = 'ok' | 'waking' | 'down' | 'ready';

export interface ServiceStatus {
  phase: Phase;
  /** When the trouble was first noticed (ms). */
  since: number;
  /** When a normal cold start should be done (ms): what the countdown counts down to. */
  expectedBy: number;
}

export type StatusSnapshot = Readonly<Record<BackendService, ServiceStatus>>;

/** Typical cold start on Render's free plan, measured: RailLens ~30-60 s; RailOps has five services to wake. */
export const EXPECTED_WAKE_MS: Record<BackendService, number> = {
  raillens: 60_000,
  railops: 90_000,
};
/** Longer than any cold start: past this it's not sleeping, it's down. */
export const GIVE_UP_MS: Record<BackendService, number> = {
  raillens: 180_000,
  railops: 240_000,
};
export const POLL_MS = 5_000;
/** Once down, check less often (it can take minutes), but keep checking so "ready" still shows up. */
export const DOWN_POLL_MS = 30_000;
/** A single 5xx can be a restart in progress; two in a row means down. */
export const DOWN_AFTER = 2;

type ProbeState = 'up' | 'waking' | 'down' | 'unconfigured';

export interface StoreDeps {
  probe: (service: BackendService) => Promise<ProbeState>;
  now: () => number;
  schedule: (fn: () => void, ms: number) => unknown;
  cancel: (handle: unknown) => void;
}

const OK: ServiceStatus = { phase: 'ok', since: 0, expectedBy: 0 };

export function createBackendStatusStore(deps: StoreDeps) {
  let state: StatusSnapshot = { raillens: OK, railops: OK };
  const listeners = new Set<() => void>();
  const timers: Partial<Record<BackendService, unknown>> = {};
  const downStreak: Record<BackendService, number> = {
    raillens: 0,
    railops: 0,
  };

  function set(service: BackendService, next: ServiceStatus) {
    state = { ...state, [service]: next };
    listeners.forEach((l) => l());
  }

  function stop(service: BackendService) {
    if (timers[service] !== undefined) deps.cancel(timers[service]);
    delete timers[service];
  }

  function next(service: BackendService, ms: number) {
    stop(service);
    timers[service] = deps.schedule(() => void check(service), ms);
  }

  async function check(service: BackendService) {
    delete timers[service];
    const current = state[service];
    if (current.phase === 'ok' || current.phase === 'ready') return;
    let result: ProbeState;
    try {
      result = await deps.probe(service);
    } catch {
      result = 'waking'; // our own site unreachable: most likely the visitor's connection; keep waiting
    }
    const now = deps.now();
    const s = state[service];
    if (s.phase === 'ok' || s.phase === 'ready') return; // dismissed meanwhile
    if (result === 'up' || result === 'unconfigured') {
      downStreak[service] = 0;
      set(service, { ...s, phase: result === 'up' ? 'ready' : 'ok' });
      return;
    }
    if (result === 'down') {
      downStreak[service] += 1;
    } else {
      downStreak[service] = 0;
    }
    const isDown =
      downStreak[service] >= DOWN_AFTER || now - s.since >= GIVE_UP_MS[service];
    if (isDown && s.phase !== 'down') set(service, { ...s, phase: 'down' });
    next(service, isDown ? DOWN_POLL_MS : POLL_MS);
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    /** A request to this backend failed in a way that means "unreachable" (see isBackendTrouble). */
    report(service: BackendService) {
      const s = state[service];
      if (s.phase === 'waking' || s.phase === 'down') return; // already watching
      const now = deps.now();
      downStreak[service] = 0;
      set(service, {
        phase: 'waking',
        since: now,
        expectedBy: now + EXPECTED_WAKE_MS[service],
      });
      void check(service);
    },
    /**
     * Something failed but we don't know why (an error page without a status). Check quietly first and only show
     * the banner if the backend really isn't up, so an ordinary error never shows "waking up".
     */
    async suspect(service: BackendService) {
      const s = state[service];
      if (s.phase === 'waking' || s.phase === 'down') return;
      let result: ProbeState;
      try {
        result = await deps.probe(service);
      } catch {
        return;
      }
      if (result === 'up' || result === 'unconfigured') return;
      this.report(service);
    },
    /** "Check now" from the banner while down. */
    recheck(service: BackendService) {
      if (state[service].phase !== 'down') return;
      stop(service);
      void check(service);
    },
    dismiss(service: BackendService) {
      stop(service);
      downStreak[service] = 0;
      set(service, OK);
    },
  };
}

export type BackendStatusStore = ReturnType<typeof createBackendStatusStore>;

/**
 * True when a failure means "the backend isn't there" rather than "the request was wrong": no answer at all
 * (status 0: network error or timeout) or a 502/503/504 from Render's proxy.
 */
export function isBackendTrouble(status: number): boolean {
  return status === 0 || status === 502 || status === 503 || status === 504;
}

async function probeViaThisSite(service: BackendService): Promise<ProbeState> {
  const res = await fetch(`/api/backend-status?service=${service}`, {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return 'waking';
  const body = (await res.json()) as { state?: ProbeState };
  return body.state ?? 'waking';
}

let browserStore: BackendStatusStore | null = null;

/** The page-wide store (browser only). */
export function backendStatus(): BackendStatusStore {
  if (!browserStore) {
    browserStore = createBackendStatusStore({
      probe: probeViaThisSite,
      now: () => Date.now(),
      schedule: (fn, ms) => setTimeout(fn, ms),
      cancel: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    });
  }
  return browserStore;
}

/** For error pages that don't know the status (see suspect). Browser only. */
export function suspectBackendTrouble(service: BackendService) {
  if (typeof window === 'undefined') return;
  void backendStatus().suspect(service);
}

/** Called by request code; does nothing on the server (pages rendered there report from ErrorState instead). */
export function reportBackendTrouble(service: BackendService, status: number) {
  if (typeof window === 'undefined' || !isBackendTrouble(status)) return;
  backendStatus().report(service);
}
