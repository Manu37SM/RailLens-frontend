'use client';
import { createLocalStorageStore } from './createLocalStorageStore';
import { UserPreferences } from '@/types/preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultFromStationCode: null,
  defaultFromStationName: null,
};
const store = createLocalStorageStore<UserPreferences>(
  'preferences',
  DEFAULT_PREFERENCES
);
export function setDefaultFromStation(
  stationCode: string,
  stationName: string
) {
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
