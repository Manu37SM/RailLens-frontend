'use client';

// The one item left on the Personalization wishlist beyond theme/Favorites/
// Recent Searches/Saved Journeys: a default "From" station for the journey
// planner, for anyone who mostly checks trains from the same home station.
// Same createLocalStorageStore pattern as every other on-device preference
// in this app - no backend needed, nothing here is sensitive.
//
// A "preferred date format" was considered too (it was on the original
// wishlist alongside this), but there's nowhere in the app that actually
// displays or lets you pick a calendar date yet - schedules are weekly/
// day-of-week based, not tied to a specific journey date (see Future Live
// Features in project memory: PNR/dated journeys are blocked on a live
// data source RailLens doesn't have). Add it if/when that changes rather
// than building a preference with no surface to apply it to.

import { createLocalStorageStore } from './createLocalStorageStore';
import { UserPreferences } from '@/types/preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultFromStationCode: null,
  defaultFromStationName: null,
};

const store = createLocalStorageStore<UserPreferences>('preferences', DEFAULT_PREFERENCES);

export function setDefaultFromStation(stationCode: string, stationName: string) {
  store.set({
    defaultFromStationCode: stationCode,
    defaultFromStationName: stationName,
  });
}

export function clearDefaultFromStation() {
  store.set(DEFAULT_PREFERENCES);
}

export function getPreferences() {
  return store.get();
}

export const usePreferences = store.useStore;
