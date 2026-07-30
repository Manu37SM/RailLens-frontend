import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearSavedJourneys,
  getSavedJourneys,
  isJourneySaved,
  removeSavedJourney,
  toggleSavedJourney,
} from './savedJourneyStore';

const journeyInput = {
  trainNumber: '12301',
  trainName: 'Rajdhani Express',
  boardingStationCode: 'NDLS',
  boardingStationName: 'New Delhi',
  deboardingStationCode: 'HWH',
  deboardingStationName: 'Howrah Jn',
  distanceKm: 1447,
  durationMinutes: 1020,
};

describe('savedJourneyStore', () => {
  beforeEach(() => {
    clearSavedJourneys();
    window.localStorage.clear();
  });

  it('starts empty', () => {
    expect(getSavedJourneys()).toEqual([]);
    expect(
      isJourneySaved(
        journeyInput.trainNumber,
        journeyInput.boardingStationCode,
        journeyInput.deboardingStationCode
      )
    ).toBe(false);
  });

  it('toggleSavedJourney() saves a journey with a generated id and timestamp', () => {
    toggleSavedJourney(journeyInput);

    const [saved] = getSavedJourneys();
    expect(saved.id).toBe('12301-NDLS-HWH');
    expect(typeof saved.savedAt).toBe('string');
    expect(
      isJourneySaved(
        journeyInput.trainNumber,
        journeyInput.boardingStationCode,
        journeyInput.deboardingStationCode
      )
    ).toBe(true);
  });

  it('toggleSavedJourney() removes an already-saved journey', () => {
    toggleSavedJourney(journeyInput);
    toggleSavedJourney(journeyInput);

    expect(getSavedJourneys()).toEqual([]);
  });

  it('the same train with a different boarding/de-boarding pair is a distinct journey', () => {
    toggleSavedJourney(journeyInput);
    toggleSavedJourney({
      ...journeyInput,
      boardingStationCode: 'AGC',
      boardingStationName: 'Agra Cantt',
    });

    expect(getSavedJourneys()).toHaveLength(2);
  });

  it('removeSavedJourney() removes by id', () => {
    toggleSavedJourney(journeyInput);
    const [saved] = getSavedJourneys();

    removeSavedJourney(saved.id);

    expect(getSavedJourneys()).toEqual([]);
  });

  it('clearSavedJourneys() empties the list', () => {
    toggleSavedJourney(journeyInput);
    clearSavedJourneys();

    expect(getSavedJourneys()).toEqual([]);
  });
});
