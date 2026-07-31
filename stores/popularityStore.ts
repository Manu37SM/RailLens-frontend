'use client';

// Per-device view-count tracking, entirely client-side - there is no
// server-side analytics/event-logging in this project (see project
// memory: "user analytics (admin)" was explicitly left as a bigger,
// ask-first feature). This is deliberately scoped smaller: "trains/
// stations you've viewed most on this device," not "what's popular
// site-wide." The home page section built on this must say so, not
// imply it's a global ranking - that would be a real, misleading claim
// this feature can't back up without server-side telemetry.

import { createLocalStorageStore } from './createLocalStorageStore';
import { PopularEntry, PopularityState } from '@/types/popularity';

const EMPTY_STATE: PopularityState = { trains: {}, stations: {} };

// Without a cap, a long-lived user browsing widely across the ~14,000-train/
// several-thousand-station catalog over months would grow this map's key
// count roughly proportional to the dataset itself - unbounded localStorage
// growth, and topEntries() below sorts the whole map on every read, so an
// uncapped map also means an ever-growing sort on every popularity lookup.
// 200 is generous headroom over what's ever actually displayed (top 5/10),
// so this never affects normal usage, only the pathological long-tail case.
const MAX_ENTRIES_PER_BUCKET = 200;

const store = createLocalStorageStore<PopularityState>('popularity', EMPTY_STATE);

function recordView(bucket: 'trains' | 'stations', code: string, name: string) {
  store.update((state) => {
    const existing = state[bucket][code];
    const nextBucket = { ...state[bucket] };

    if (!existing && Object.keys(nextBucket).length >= MAX_ENTRIES_PER_BUCKET) {
      // At capacity and this is a genuinely new entry - evict the
      // least-viewed one to make room rather than let the map keep
      // growing.
      let leastViewedCode: string | null = null;
      let leastViews = Infinity;

      for (const entry of Object.values(nextBucket)) {
        if (entry.views < leastViews) {
          leastViews = entry.views;
          leastViewedCode = entry.code;
        }
      }

      if (leastViewedCode) {
        delete nextBucket[leastViewedCode];
      }
    }

    nextBucket[code] = {
      code,
      name,
      views: (existing?.views ?? 0) + 1,
    };

    return {
      ...state,
      [bucket]: nextBucket,
    };
  });
}

export function recordTrainView(trainNumber: string, trainName: string) {
  recordView('trains', trainNumber, trainName);
}

export function recordStationView(stationCode: string, stationName: string) {
  recordView('stations', stationCode, stationName);
}

function topEntries(entries: Record<string, PopularEntry>, limit: number): PopularEntry[] {
  return Object.values(entries)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function getPopularTrains(limit = 5): PopularEntry[] {
  return topEntries(store.get().trains, limit);
}

export function getPopularStations(limit = 5): PopularEntry[] {
  return topEntries(store.get().stations, limit);
}

// Matches the clear*() convention every other on-device store in this app
// exposes (clearFavorites, clearRecentSearches, clearSavedJourneys,
// clearDefaultFromStation) - lets a user wipe this device's view-count
// history from their preferences/account UI without clearing every other
// piece of on-device state at once.
export function clearPopularity() {
  store.set(EMPTY_STATE);
}

export const usePopularity = store.useStore;
