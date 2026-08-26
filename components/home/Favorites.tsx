'use client';
import { Heart, MapPin, Route, TrainFront } from 'lucide-react';
import QuickAccessCard from './QuickAccessCard';
import { useFavorites } from '@/stores/favoritesStore';
import { QuickAccessItem } from '@/types/quickAccess';
export default function Favorites() {
  const favorites = useFavorites();
  const items: QuickAccessItem[] = favorites
    .slice(0, 5)
    .map((favorite): QuickAccessItem => {
      switch (favorite.type) {
        case 'train':
          return {
            key: favorite.trainNumber,
            href: `/trains/${favorite.trainNumber}`,
            title: favorite.trainName,
            subtitle: favorite.trainNumber,
            icon: TrainFront,
          };
        case 'station':
          return {
            key: favorite.stationCode,
            href: `/stations/${favorite.stationCode}`,
            title: favorite.stationName,
            subtitle: favorite.stationCode,
            icon: MapPin,
          };
        case 'route':
          return {
            key: `${favorite.fromStationCode}-${favorite.toStationCode}`,
            href: `/journeys?from=${favorite.fromStationCode}&to=${favorite.toStationCode}`,
            title: `${favorite.fromStationCode} → ${favorite.toStationCode}`,
            subtitle: `${favorite.fromStationName} to ${favorite.toStationName}`,
            icon: Route,
          };
      }
    });
  return (
    <QuickAccessCard
      title="Favorites"
      description="Quick access to your saved trains and stations."
      icon={Heart}
      items={items}
      emptyTitle="No favorites yet"
      emptyDescription="Save trains or stations to access them quickly."
      emptyHref="/trains"
      emptyHrefLabel="Browse trains"
    />
  );
}
