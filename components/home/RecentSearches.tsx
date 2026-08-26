'use client';
import { Clock3, MapPin, Route, TrainFront } from 'lucide-react';
import QuickAccessCard from './QuickAccessCard';
import { useRecentSearches } from '@/stores/recentSearchStore';
import { QuickAccessItem } from '@/types/quickAccess';
export default function RecentSearches() {
  const searches = useRecentSearches();
  const items: QuickAccessItem[] = searches.slice(0, 5).map((search) => {
    switch (search.type) {
      case 'train':
        return {
          key: search.trainNumber,
          href: `/trains/${search.trainNumber}`,
          title: search.trainName,
          subtitle: `Train • ${search.trainNumber}`,
          icon: TrainFront,
        };
      case 'station':
        return {
          key: search.stationCode,
          href: `/stations/${search.stationCode}`,
          title: search.stationName,
          subtitle: `Station • ${search.stationCode}`,
          icon: MapPin,
        };
      case 'journey':
        return {
          key: `${search.fromCode}-${search.toCode}`,
          href: `/journeys?from=${search.fromCode}&to=${search.toCode}`,
          title: `${search.fromName} → ${search.toName}`,
          subtitle: `${search.fromCode} → ${search.toCode}`,
          icon: Route,
        };
    }
  });
  return (
    <QuickAccessCard
      title="Recent Searches"
      description="Continue where you left off."
      icon={Clock3}
      items={items}
      emptyTitle="No recent searches"
      emptyDescription="Your latest searches will appear here."
    />
  );
}
