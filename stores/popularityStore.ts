'use client';
import { createLocalStorageStore } from './createLocalStorageStore';
import { PopularEntry, PopularityState } from '@/types/popularity';
const EMPTY_STATE: PopularityState = { trains: {}, stations: {} };
const MAX_ENTRIES_PER_BUCKET = 200;
const store = createLocalStorageStore<PopularityState>(
  'popularity',
  EMPTY_STATE
);
function recordView(bucket: 'trains' | 'stations', code: string, name: string) {
  store.update((state) => {
    const existing = state[bucket][code];
    const nextBucket = { ...state[bucket] };
    if (!existing && Object.keys(nextBucket).length >= MAX_ENTRIES_PER_BUCKET) {
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
function topEntries(
  entries: Record<string, PopularEntry>,
  limit: number
): PopularEntry[] {
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
export function clearPopularity() {
  store.set(EMPTY_STATE);
}
export const usePopularity = store.useStore;
