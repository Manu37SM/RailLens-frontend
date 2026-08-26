'use client';
import { MapPin, TrainFront } from 'lucide-react';
import QuickAccessCard from './QuickAccessCard';
import {
  usePopularity,
  getPopularTrains,
  getPopularStations,
} from '@/stores/popularityStore';
import { QuickAccessItem } from '@/types/quickAccess';
export default function Popular() {
  usePopularity();
  const trainItems: QuickAccessItem[] = getPopularTrains(5).map((entry) => ({
    key: entry.code,
    href: `/trains/${entry.code}`,
    title: entry.name,
    subtitle: `${entry.code} · viewed ${entry.views}×`,
    icon: TrainFront,
  }));
  const stationItems: QuickAccessItem[] = getPopularStations(5).map(
    (entry) => ({
      key: entry.code,
      href: `/stations/${entry.code}`,
      title: entry.name,
      subtitle: `${entry.code} · viewed ${entry.views}×`,
      icon: MapPin,
    })
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <QuickAccessCard
        title="Trains You View Often"
        description="Based on what you've looked up on this device."
        icon={TrainFront}
        items={trainItems}
        emptyTitle="Nothing yet"
        emptyDescription="Trains you look up will show up here."
        emptyHref="/trains"
        emptyHrefLabel="Browse trains"
      />

      <QuickAccessCard
        title="Stations You View Often"
        description="Based on what you've looked up on this device."
        icon={MapPin}
        items={stationItems}
        emptyTitle="Nothing yet"
        emptyDescription="Stations you look up will show up here."
        emptyHref="/stations"
        emptyHrefLabel="Browse stations"
      />
    </div>
  );
}
