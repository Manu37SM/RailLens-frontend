import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearPopularSearches,
  getPopularStationSearches,
  getPopularTrainSearches,
  recordStationSearch,
  recordTrainSearch,
} from './popularSearchStore';

describe('popularSearchStore', () => {
  beforeEach(() => {
    clearPopularSearches();
    window.localStorage.clear();
  });

  it('starts with no popular searches', () => {
    expect(getPopularTrainSearches()).toEqual([]);
    expect(getPopularStationSearches()).toEqual([]);
  });

  it('ignores queries shorter than the minimum length', () => {
    recordTrainSearch('a');
    expect(getPopularTrainSearches()).toEqual([]);
  });

  it('is case-insensitive but preserves the first-seen display casing', () => {
    recordTrainSearch('Raj');
    recordTrainSearch('raj');
    recordTrainSearch('RAJ');

    const [entry] = getPopularTrainSearches();
    expect(entry).toMatchObject({ query: 'raj', displayQuery: 'Raj', count: 3 });
  });

  it('trims whitespace before matching', () => {
    recordStationSearch('  ndls  ');
    recordStationSearch('ndls');

    const searches = getPopularStationSearches();
    expect(searches).toHaveLength(1);
    expect(searches[0].count).toBe(2);
  });

  it('ranks by count, most-searched first', () => {
    recordTrainSearch('rajdhani');
    recordTrainSearch('shatabdi');
    recordTrainSearch('shatabdi');

    const top = getPopularTrainSearches();
    expect(top[0]).toMatchObject({ query: 'shatabdi', count: 2 });
  });

  it('keeps train and station search tracking independent', () => {
    recordTrainSearch('rajdhani');
    recordStationSearch('delhi');

    expect(getPopularTrainSearches()).toHaveLength(1);
    expect(getPopularStationSearches()).toHaveLength(1);
  });

  it('clearPopularSearches() resets both buckets', () => {
    recordTrainSearch('rajdhani');
    recordStationSearch('delhi');

    clearPopularSearches();

    expect(getPopularTrainSearches()).toEqual([]);
    expect(getPopularStationSearches()).toEqual([]);
  });
});
