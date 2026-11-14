import { describe, expect, it, vi } from 'vitest';
import {
  createBackendStatusStore,
  DOWN_POLL_MS,
  EXPECTED_WAKE_MS,
  GIVE_UP_MS,
  isBackendTrouble,
  POLL_MS,
} from './store';

type Probe = 'up' | 'waking' | 'down' | 'unconfigured';

/** A store on a fake clock: run() advances time and fires the scheduled checks in order. */
function harness(answers: Probe[]) {
  let now = 1_000_000;
  const queue: { at: number; fn: () => void; id: number }[] = [];
  let ids = 0;
  const probe = vi.fn(async () => answers.shift() ?? 'waking');
  const store = createBackendStatusStore({
    probe,
    now: () => now,
    schedule: (fn, ms) => {
      const id = ++ids;
      queue.push({ at: now + ms, fn, id });
      return id;
    },
    cancel: (id) => {
      const i = queue.findIndex((q) => q.id === id);
      if (i >= 0) queue.splice(i, 1);
    },
  });
  const flush = () => new Promise((r) => setTimeout(r, 0));
  async function run(ms: number) {
    const end = now + ms;
    await flush();
    for (;;) {
      queue.sort((a, b) => a.at - b.at);
      const next = queue[0];
      if (!next || next.at > end) break;
      queue.shift();
      now = next.at;
      next.fn();
      await flush();
    }
    now = end;
  }
  return { store, probe, run, phase: () => store.getSnapshot().raillens.phase };
}

describe('backend status store', () => {
  it('a sleeping backend: waking with a countdown, then ready when it answers', async () => {
    const h = harness(['waking', 'waking', 'up']);
    h.store.report('raillens');
    const s = h.store.getSnapshot().raillens;
    expect(s.phase).toBe('waking');
    expect(s.expectedBy - s.since).toBe(EXPECTED_WAKE_MS.raillens);

    await h.run(POLL_MS);
    expect(h.phase()).toBe('waking');
    await h.run(POLL_MS);
    expect(h.phase()).toBe('ready');
    expect(h.probe).toHaveBeenCalledTimes(3);
    await h.run(60_000);
    expect(h.probe).toHaveBeenCalledTimes(3); // stops polling once ready
  });

  it('two 5xx answers in a row mean down (crash, out of memory, restart); it still notices when it comes back', async () => {
    const h = harness(['down', 'down', 'down', 'up']);
    h.store.report('raillens');
    await h.run(0);
    expect(h.phase()).toBe('waking'); // one 5xx can be a restart in progress
    await h.run(POLL_MS);
    expect(h.phase()).toBe('down');
    await h.run(DOWN_POLL_MS);
    expect(h.phase()).toBe('down');
    await h.run(DOWN_POLL_MS);
    expect(h.phase()).toBe('ready');
  });

  it('never answering for longer than any cold start also means down', async () => {
    const h = harness([]);
    h.store.report('raillens');
    await h.run(GIVE_UP_MS.raillens - POLL_MS);
    expect(h.phase()).toBe('waking');
    await h.run(POLL_MS);
    expect(h.phase()).toBe('down');
  });

  it('more failures while already watching do not restart the countdown', async () => {
    const h = harness([]);
    h.store.report('raillens');
    const first = h.store.getSnapshot().raillens.since;
    await h.run(10_000);
    h.store.report('raillens');
    expect(h.store.getSnapshot().raillens.since).toBe(first);
  });

  it('closing the banner stops the checks', async () => {
    const h = harness([]);
    h.store.report('raillens');
    await h.run(0);
    h.store.dismiss('raillens');
    const calls = h.probe.mock.calls.length;
    await h.run(60_000);
    expect(h.phase()).toBe('ok');
    expect(h.probe).toHaveBeenCalledTimes(calls);
  });

  it('suspect() stays silent when the backend is actually up', async () => {
    const h = harness(['up']);
    await h.store.suspect('raillens');
    expect(h.phase()).toBe('ok');
  });

  it('suspect() shows the banner when it is not', async () => {
    const h = harness(['waking', 'waking']);
    await h.store.suspect('raillens');
    expect(h.phase()).toBe('waking');
  });

  it('a backend this site does not use clears itself', async () => {
    const h = harness(['unconfigured']);
    h.store.report('raillens');
    await h.run(0);
    expect(h.phase()).toBe('ok');
  });

  it('only "no answer" and 502/503/504 count as the backend being unreachable', () => {
    expect([0, 502, 503, 504].every(isBackendTrouble)).toBe(true);
    expect([400, 401, 404, 409, 429, 500].some(isBackendTrouble)).toBe(false);
  });
});
