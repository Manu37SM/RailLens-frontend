'use client';

import { Heart, MapPin, TrainFront } from 'lucide-react';

import QuickAccessCard from './QuickAccessCard';

import { useFavorites } from '@/stores/favoritesStore';
import { QuickAccessItem } from '@/types/quickAccess';

export default function Favorites() {
  const favorites = useFavorites();

  const items: QuickAccessItem[] = favorites.slice(0, 5).map((favorite) => {
    if (favorite.type === 'train') {
      return {
        key: favorite.trainNumber,
        href: `/trains/${favorite.trainNumber}`,
        title: favorite.trainName,
        subtitle: favorite.trainNumber,
        icon: TrainFront,
      };
    }

    return {
      key: favorite.stationCode,
      href: `/stations/${favorite.stationCode}`,
      title: favorite.stationName,
      subtitle: favorite.stationCode,
      icon: MapPin,
    };
  });

  return (
    <QuickAccessCard
      title="Favorites"
      description="Your saved trains and stations."
      icon={Heart}
      items={items}
      emptyTitle="No favorites yet"
      emptyDescription="Save trains or stations to access them quickly."
      emptyHref="/trains"
      emptyHrefLabel="Browse trains"
    />
  );
}
