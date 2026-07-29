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

const store = createLocalStorageStore<PopularityState>('popularity', EMPTY_STATE);

function recordView(bucket: 'trains' | 'stations', code: string, name: string) {
  store.update((state) => {
    const existing = state[bucket][code];

    return {
      ...state,
      [bucket]: {
        ...state[bucket],
        [code]: {
          code,
          name,
          views: (existing?.views ?? 0) + 1,
        },
      },
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

export const usePopularity = store.useStore;
