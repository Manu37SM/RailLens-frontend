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
      className={`rounded-lg border p-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
        favorited
          ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
          : 'border-slate-300 bg-white text-slate-600'
      }`}
    >
      <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
    </button>
  );
}
