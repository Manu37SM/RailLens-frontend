'use client';

// Per-device search-term tracking, entirely client-side - same scoping
// rationale as popularityStore.ts (view tracking): there is no
// server-side search-analytics/event-logging in this project, so "popular
// searches" here means "queries you've typed on this device," not a
// site-wide trending list. Deliberately a separate store from
// popularityStore (which tracks *viewed entities*, not *typed queries*) -
// searching "raj" and then opening "12301 Rajdhani Express" are two
// different signals worth keeping distinct.

import { createLocalStorageStore } from './createLocalStorageStore';
import { PopularSearchEntry, PopularSearchState } from '@/types/popularSearch';

const EMPTY_STATE: PopularSearchState = { trains: {}, stations: {} };
const MIN_QUERY_LENGTH = 2;

// Keyed by free-text query rather than a bounded ID space (unlike
// popularityStore's train/station codes), so this can otherwise grow
// without limit as a user types more distinct queries over time - same
// unbounded-localStorage-growth / ever-growing-sort risk as popularityStore,
// same fix.
const MAX_ENTRIES_PER_BUCKET = 200;

const store = createLocalStorageStore<PopularSearchState>('popular-searches', EMPTY_STATE);

function recordSearch(bucket: 'trains' | 'stations', rawQuery: string) {
  const displayQuery = rawQuery.trim();
  const query = displayQuery.toLowerCase();

  if (query.length < MIN_QUERY_LENGTH) {
    return;
  }

  store.update((state) => {
    const existing = state[bucket][query];
    const nextBucket = { ...state[bucket] };

    if (!existing && Object.keys(nextBucket).length >= MAX_ENTRIES_PER_BUCKET) {
      let leastSearchedQuery: string | null = null;
      let leastCount = Infinity;

      for (const entry of Object.values(nextBucket)) {
        if (entry.count < leastCount) {
          leastCount = entry.count;
          leastSearchedQuery = entry.query;
        }
      }

      if (leastSearchedQuery) {
        delete nextBucket[leastSearchedQuery];
      }
    }

    nextBucket[query] = {
      query,
      displayQuery: existing?.displayQuery ?? displayQuery,
      count: (existing?.count ?? 0) + 1,
    };

    return {
      ...state,
      [bucket]: nextBucket,
    };
  });
}

export function recordTrainSearch(query: string) {
  recordSearch('trains', query);
}

export function recordStationSearch(query: string) {
  recordSearch('stations', query);
}

function topEntries(entries: Record<string, PopularSearchEntry>, limit: number): PopularSearchEntry[] {
  return Object.values(entries)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getPopularTrainSearches(limit = 5): PopularSearchEntry[] {
  return topEntries(store.get().trains, limit);
}

export function getPopularStationSearches(limit = 5): PopularSearchEntry[] {
  return topEntries(store.get().stations, limit);
}

// Same clear*() convention as clearPopularity() / clearFavorites() / etc.
export function clearPopularSearches() {
  store.set(EMPTY_STATE);
}

export const usePopularSearches = store.useStore;
