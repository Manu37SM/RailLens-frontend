'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@/components/ui/Card';
import StationAutocomplete from '@/components/search/StationAutocomplete';
import { addStationSearch } from '@/components/stores/recentSearchStore';

import { StationSearchResponse } from '@/types/station';

export default function StationSearchClient() {
  const router = useRouter();

  const [station, setStation] = useState<StationSearchResponse | null>(null);

  return (
    <Card>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <StationAutocomplete
            label="Station"
            placeholder="Search station..."
            onSelect={setStation}
          />
        </div>

        <button
          onClick={() => {
            if (!station) return;

            addStationSearch(station.stationCode, station.stationName);

            router.push(`/stations/${station.stationCode}`);
          }}
          disabled={!station}
          className="bg-primary flex h-14 items-center justify-center rounded-2xl px-8 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Search
        </button>
      </div>
    </Card>
  );
}
