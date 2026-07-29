'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MapPin, Route, Trash2, TrainFront, X } from 'lucide-react';

import Card from '@/components/layout/Card';
import { clearFavorites, toggleFavorite, useFavorites } from '@/stores/favoritesStore';
import { Favorite } from '@/types/favorite';

// Mirrors components/history/SearchHistoryList.tsx's structure (href/key/
// icon/title/subtitle switches, confirm-before-clear-all) so favorites and
// search history - the app's two localStorage-backed list features - look
// and behave the same way rather than each inventing its own layout.

function favoriteHref(favorite: Favorite): string {
  switch (favorite.type) {
    case 'train':
      return `/trains/${favorite.trainNumber}`;
    case 'station':
      return `/stations/${favorite.stationCode}`;
    case 'route':
      return `/journeys?from=${favorite.fromStationCode}&to=${favorite.toStationCode}`;
  }
}

function favoriteKey(favorite: Favorite): string {
  switch (favorite.type) {
    case 'train':
      return `train-${favorite.trainNumber}`;
    case 'station':
      return `station-${favorite.stationCode}`;
    case 'route':
      return `route-${favorite.fromStationCode}-${favorite.toStationCode}`;
  }
}

function favoriteTitle(favorite: Favorite): string {
  switch (favorite.type) {
    case 'train':
      return `${favorite.trainNumber} · ${favorite.trainName}`;
    case 'station':
      return `${favorite.stationCode} · ${favorite.stationName}`;
    case 'route':
      return `${favorite.fromStationCode} → ${favorite.toStationCode}`;
  }
}

function favoriteSubtitle(favorite: Favorite): string {
  switch (favorite.type) {
    case 'train':
      return 'Train';
    case 'station':
      return 'Station';
    case 'route':
      return `${favorite.fromStationName} to ${favorite.toStationName}`;
  }
}

function FavoriteIcon({ type }: { type: Favorite['type'] }) {
  const className = 'h-5 w-5 text-orange-600';
  if (type === 'train') return <TrainFront className={className} aria-hidden="true" />;
  if (type === 'station') return <MapPin className={className} aria-hidden="true" />;
  return <Route className={className} aria-hidden="true" />;
}

export default function FavoritesList() {
  const favorites = useFavorites();
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (favorites.length === 0) {
    return (
      <Card className="py-10">
        <div className="flex flex-col items-center text-center">
          <Heart className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No favorites yet
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Save trains or stations from their detail pages to access them
            quickly here.
          </p>

          <Link
            href="/trains"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Browse trains
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        {confirmingClear ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Remove all {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}?
            </span>
            <button
              type="button"
              onClick={() => {
                clearFavorites();
                setConfirmingClear(false);
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {favorites.map((favorite) => (
          <Card
            key={favoriteKey(favorite)}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100">
              <FavoriteIcon type={favorite.type} />
            </div>

            <Link href={favoriteHref(favorite)} className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {favoriteTitle(favorite)}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {favoriteSubtitle(favorite)}
              </p>
            </Link>

            <button
              type="button"
              onClick={() => toggleFavorite(favorite)}
              aria-label={`Remove ${favoriteTitle(favorite)} from favorites`}
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
