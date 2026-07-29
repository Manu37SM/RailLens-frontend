'use client';

import { createLocalStorageStore } from './createLocalStorageStore';
import { Favorite } from '@/types/favorite';

const store = createLocalStorageStore<Favorite[]>('favorites', []);

function isSameFavorite(a: Favorite, b: Favorite): boolean {
  switch (a.type) {
    case 'train':
      return b.type === 'train' && b.trainNumber === a.trainNumber;

    case 'station':
      return b.type === 'station' && b.stationCode === a.stationCode;

    case 'route':
      return (
        b.type === 'route' &&
        b.fromStationCode === a.fromStationCode &&
        b.toStationCode === a.toStationCode
      );

    default:
      return false;
  }
}

export function toggleFavorite(favorite: Favorite) {
  store.update((favorites) => {
    const exists = favorites.some((item) => isSameFavorite(favorite, item));

    if (exists) {
      return favorites.filter((item) => !isSameFavorite(favorite, item));
    }

    return [favorite, ...favorites];
  });
}

export function isFavorite(favorite: Favorite) {
  return store.get().some((item) => isSameFavorite(favorite, item));
}

export function clearFavorites() {
  store.set([]);
}

export function getFavorites() {
  return store.get();
}

export const useFavorites = store.useStore;
