import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addJourneySearch,
  addStationSearch,
  addTrainSearch,
  clearRecentSearches,
  getRecentSearches,
  removeSearch,
} from './recentSearchStore';

describe('recentSearchStore', () => {
  beforeEach(() => {
    clearRecentSearches();
    window.localStorage.clear();
  });

  it('starts empty', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('addTrainSearch() records a train search with a timestamp', () => {
    addTrainSearch('12301', 'Rajdhani Express');

    const [entry] = getRecentSearches();
    expect(entry).toMatchObject({
      type: 'train',
      trainNumber: '12301',
      trainName: 'Rajdhani Express',
    });
    expect(typeof entry.timestamp).toBe('number');
  });

  it('newest search is added to the front', () => {
    addStationSearch('NDLS', 'New Delhi');
    addStationSearch('HWH', 'Howrah Jn');

    const searches = getRecentSearches();
    expect(searches).toHaveLength(2);
    expect(searches[0]).toMatchObject({ stationCode: 'HWH' });
    expect(searches[1]).toMatchObject({ stationCode: 'NDLS' });
  });

  it('re-searching the same train moves it to the front instead of duplicating it', () => {
    addTrainSearch('12301', 'Rajdhani Express');
    addTrainSearch('12951', 'Mumbai Rajdhani');
    addTrainSearch('12301', 'Rajdhani Express');

    const searches = getRecentSearches();
    expect(searches).toHaveLength(2);
    expect(searches[0]).toMatchObject({ trainNumber: '12301' });
  });

  it('journey searches are matched by from/to code pair, independent of train/station searches', () => {
    addJourneySearch('NDLS', 'New Delhi', 'HWH', 'Howrah Jn');
    addStationSearch('NDLS', 'New Delhi');

    expect(getRecentSearches()).toHaveLength(2);
  });

  it('removeSearch() removes only the matching entry', () => {
    addTrainSearch('12301', 'Rajdhani Express');
    addTrainSearch('12951', 'Mumbai Rajdhani');

    removeSearch({
      type: 'train',
      trainNumber: '12301',
      trainName: 'Rajdhani Express',
      timestamp: Date.now(),
    });

    const searches = getRecentSearches();
    expect(searches).toHaveLength(1);
    expect(searches[0]).toMatchObject({ trainNumber: '12951' });
  });

  it('caps the list at 50 entries, dropping the oldest', () => {
    vi.useFakeTimers();

    for (let i = 0; i < 55; i += 1) {
      vi.setSystemTime(new Date(2026, 0, 1, 0, 0, i));
      addStationSearch(`STN${i}`, `Station ${i}`);
    }

    const searches = getRecentSearches();
    expect(searches).toHaveLength(50);
    // Most recent (STN54) stays, oldest (STN0..STN4) got dropped.
    expect(searches[0]).toMatchObject({ stationCode: 'STN54' });
    expect(searches.some((s) => 'stationCode' in s && s.stationCode === 'STN0')).toBe(
      false
    );

    vi.useRealTimers();
  });

  it('clearRecentSearches() empties the list', () => {
    addTrainSearch('12301', 'Rajdhani Express');
    clearRecentSearches();

    expect(getRecentSearches()).toEqual([]);
  });
});
