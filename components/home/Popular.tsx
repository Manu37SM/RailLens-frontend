'use client';

import { MapPin, TrainFront } from 'lucide-react';

import QuickAccessCard from './QuickAccessCard';

import { usePopularity, getPopularTrains, getPopularStations } from '@/stores/popularityStore';
import { QuickAccessItem } from '@/types/quickAccess';

/**
 * "Popular" here means "trains/stations you've viewed most on this
 * device" - purely client-side view-count tracking (see
 * stores/popularityStore.ts), not a site-wide popularity ranking. There's
 * no server-side analytics in this project to back a real global
 * ranking, and the copy below says "you've viewed" rather than implying
 * otherwise.
 */
export default function Popular() {
  // Subscribing so both lists update immediately after a view is
  // recorded elsewhere (e.g. navigating to a train detail page and back).
  usePopularity();

  const trainItems: QuickAccessItem[] = getPopularTrains(5).map((entry) => ({
    key: entry.code,
    href: `/trains/${entry.code}`,
    title: entry.name,
    subtitle: `${entry.code} · viewed ${entry.views}×`,
    icon: TrainFront,
  }));

  const stationItems: QuickAccessItem[] = getPopularStations(5).map((entry) => ({
    key: entry.code,
    href: `/stations/${entry.code}`,
    title: entry.name,
    subtitle: `${entry.code} · viewed ${entry.views}×`,
    icon: MapPin,
  }));

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
