'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@/components/layout/Card';
import StationAutocomplete from '@/components/common/StationAutocomplete';
import { addStationSearch } from '@/stores/recentSearchStore';

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
          className="bg-primary flex h-10 items-center justify-center rounded-lg px-6 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Search
        </button>
      </div>
    </Card>
  );
}
