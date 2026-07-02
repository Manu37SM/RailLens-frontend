'use client';

import { createLocalStorageStore } from './createLocalStorageStore';
import { RecentSearch } from '@/types/recentSearch';

const STORAGE_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 10;

const store = createLocalStorageStore<RecentSearch[]>(STORAGE_KEY, []);

function addSearch(search: RecentSearch) {
  store.update((searches) => {
    const filtered = searches.filter((item) => {
      switch (search.type) {
        case 'train':
          return !(
            item.type === 'train' && item.trainNumber === search.trainNumber
          );

        case 'station':
          return !(
            item.type === 'station' && item.stationCode === search.stationCode
          );

        case 'journey':
          return !(
            item.type === 'journey' &&
            item.fromCode === search.fromCode &&
            item.toCode === search.toCode
          );
      }
    });

    filtered.unshift(search);

    return filtered.slice(0, MAX_RECENT_SEARCHES);
  });
}

export function addTrainSearch(trainNumber: string, trainName: string) {
  addSearch({
    type: 'train',
    trainNumber,
    trainName,
    timestamp: Date.now(),
  });
}

export function addStationSearch(stationCode: string, stationName: string) {
  addSearch({
    type: 'station',
    stationCode,
    stationName,
    timestamp: Date.now(),
  });
}

export function addJourneySearch(
  fromCode: string,
  fromName: string,
  toCode: string,
  toName: string
) {
  addSearch({
    type: 'journey',
    fromCode,
    fromName,
    toCode,
    toName,
    timestamp: Date.now(),
  });
}

export function clearRecentSearches() {
  store.set([]);
}

export function getRecentSearches() {
  return store.get();
}

export const useRecentSearches = store.useStore;
