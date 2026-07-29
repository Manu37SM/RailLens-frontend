'use client';

import { Star } from 'lucide-react';

import {
  isFavorite,
  toggleFavorite,
  useFavorites,
} from '@/stores/favoritesStore';

import { Favorite } from '@/types/favorite';

export default function FavoriteButton({ favorite }: { favorite: Favorite }) {
  useFavorites();

  const favorited = isFavorite(favorite);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(favorite)}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`rounded-lg border p-2 transition-colors ${
        favorited
          ? 'border-yellow-300 dark:border-yellow-500/50 bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
      }`}
    >
      <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
    </button>
  );
}
