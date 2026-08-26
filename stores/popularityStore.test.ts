import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPopularity,
  getPopularStations,
  getPopularTrains,
  recordStationView,
  recordTrainView,
} from './popularityStore';
describe('popularityStore', () => {
  beforeEach(() => {
    clearPopularity();
    window.localStorage.clear();
  });
  it('starts with no popular trains or stations', () => {
    expect(getPopularTrains()).toEqual([]);
    expect(getPopularStations()).toEqual([]);
  });
  it('recordTrainView() increments the view count for repeat views', () => {
    recordTrainView('12301', 'Rajdhani Express');
    recordTrainView('12301', 'Rajdhani Express');
    recordTrainView('12301', 'Rajdhani Express');
    const [top] = getPopularTrains();
    expect(top).toMatchObject({ code: '12301', views: 3 });
  });
  it('ranks trains by view count, most-viewed first', () => {
    recordTrainView('12301', 'Rajdhani Express');
    recordTrainView('12951', 'Mumbai Rajdhani');
    recordTrainView('12951', 'Mumbai Rajdhani');
    const top = getPopularTrains();
    expect(top[0]).toMatchObject({ code: '12951', views: 2 });
    expect(top[1]).toMatchObject({ code: '12301', views: 1 });
  });
  it('respects the limit parameter', () => {
    for (let i = 0; i < 10; i += 1) {
      recordTrainView(`TRAIN${i}`, `Train ${i}`);
    }
    expect(getPopularTrains(3)).toHaveLength(3);
  });
  it('keeps train and station view counts independent', () => {
    recordTrainView('12301', 'Rajdhani Express');
    recordStationView('NDLS', 'New Delhi');
    expect(getPopularTrains()).toHaveLength(1);
    expect(getPopularStations()).toHaveLength(1);
  });
  it('clearPopularity() resets both buckets', () => {
    recordTrainView('12301', 'Rajdhani Express');
    recordStationView('NDLS', 'New Delhi');
    clearPopularity();
    expect(getPopularTrains()).toEqual([]);
    expect(getPopularStations()).toEqual([]);
  });
});
