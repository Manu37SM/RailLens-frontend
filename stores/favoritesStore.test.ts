import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearFavorites,
  getFavorites,
  isFavorite,
  toggleFavorite,
} from './favoritesStore';
import { Favorite } from '@/types/favorite';

const train: Favorite = {
  type: 'train',
  trainNumber: '12301',
  trainName: 'Rajdhani Express',
};

const station: Favorite = {
  type: 'station',
  stationCode: 'NDLS',
  stationName: 'New Delhi',
};

const route: Favorite = {
  type: 'route',
  fromStationCode: 'NDLS',
  fromStationName: 'New Delhi',
  toStationCode: 'HWH',
  toStationName: 'Howrah Jn',
};

describe('favoritesStore', () => {
  beforeEach(() => {
    clearFavorites();
    window.localStorage.clear();
  });

  it('starts empty', () => {
    expect(getFavorites()).toEqual([]);
    expect(isFavorite(train)).toBe(false);
  });

  it('toggleFavorite() adds an item that was not favorited', () => {
    toggleFavorite(train);

    expect(isFavorite(train)).toBe(true);
    expect(getFavorites()).toEqual([train]);
  });

  it('toggleFavorite() removes an item that was already favorited', () => {
    toggleFavorite(train);
    toggleFavorite(train);

    expect(isFavorite(train)).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('newest favorite is added to the front of the list', () => {
    toggleFavorite(train);
    toggleFavorite(station);

    expect(getFavorites()).toEqual([station, train]);
  });

  it('distinguishes trains, stations, and routes with the same-shaped codes', () => {
    toggleFavorite(train);
    toggleFavorite(station);
    toggleFavorite(route);

    expect(isFavorite(train)).toBe(true);
    expect(isFavorite(station)).toBe(true);
    expect(isFavorite(route)).toBe(true);
    expect(getFavorites()).toHaveLength(3);
  });

  it('matches routes only when both endpoints match', () => {
    toggleFavorite(route);

    const reversedRoute: Favorite = {
      type: 'route',
      fromStationCode: route.type === 'route' ? route.toStationCode : '',
      fromStationName: route.type === 'route' ? route.toStationName : '',
      toStationCode: route.type === 'route' ? route.fromStationCode : '',
      toStationName: route.type === 'route' ? route.fromStationName : '',
    };

    expect(isFavorite(reversedRoute)).toBe(false);
  });

  it('clearFavorites() empties the list', () => {
    toggleFavorite(train);
    toggleFavorite(station);

    clearFavorites();

    expect(getFavorites()).toEqual([]);
  });

  it('persists to localStorage under the "favorites" key', () => {
    toggleFavorite(train);

    const stored = JSON.parse(window.localStorage.getItem('favorites')!);
    expect(stored).toEqual([train]);
  });
});
