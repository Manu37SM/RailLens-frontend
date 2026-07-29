'use client';

// Distinct from favoritesStore.ts (which saves a whole train or station) -
// this saves a specific boarding/de-boarding pair on a specific train, i.e.
// a named version of the partial-journey planner's selection (see
// lib/partialJourney.ts). Same localStorage + useSyncExternalStore pattern
// as every other on-device list in this app.

import { createLocalStorageStore } from './createLocalStorageStore';
import { SavedJourney } from '@/types/savedJourney';

const store = createLocalStorageStore<SavedJourney[]>('saved-journeys', []);

function journeyId(
  trainNumber: string,
  boardingStationCode: string,
  deboardingStationCode: string
): string {
  return `${trainNumber}-${boardingStationCode}-${deboardingStationCode}`;
}

export function isJourneySaved(
  trainNumber: string,
  boardingStationCode: string,
  deboardingStationCode: string
): boolean {
  const id = journeyId(trainNumber, boardingStationCode, deboardingStationCode);
  return store.get().some((journey) => journey.id === id);
}

export function toggleSavedJourney(
  journey: Omit<SavedJourney, 'id' | 'savedAt'>
) {
  const id = journeyId(
    journey.trainNumber,
    journey.boardingStationCode,
    journey.deboardingStationCode
  );

  store.update((journeys) => {
    const exists = journeys.some((item) => item.id === id);

    if (exists) {
      return journeys.filter((item) => item.id !== id);
    }

    return [
      { ...journey, id, savedAt: new Date().toISOString() },
      ...journeys,
    ];
  });
}

export function removeSavedJourney(id: string) {
  store.update((journeys) => journeys.filter((item) => item.id !== id));
}

export function clearSavedJourneys() {
  store.set([]);
}

export function getSavedJourneys() {
  return store.get();
}

export const useSavedJourneys = store.useStore;
