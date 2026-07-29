'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Card from '@/components/layout/Card';
import StationAutocomplete from '@/components/common/StationAutocomplete';
import PopularSearchChips from '@/components/common/PopularSearchChips';
import { addStationSearch } from '@/stores/recentSearchStore';
import {
  getPopularStationSearches,
  recordStationSearch,
  usePopularSearches,
} from '@/stores/popularSearchStore';
import { searchStations } from '@/services/stationService';

import { StationSearchResponse } from '@/types/station';

export default function StationSearchClient() {
  const router = useRouter();

  const [station, setStation] = useState<StationSearchResponse | null>(null);

  // Subscribing so the chip row updates immediately after a search.
  usePopularSearches();

  function goToStation(stationCode: string, stationName: string) {
    addStationSearch(stationCode, stationName);
    recordStationSearch(stationName);
    router.push(`/stations/${stationCode}`);
  }

  return (
    <Card>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <StationAutocomplete
            label="Station"
            placeholder="Search station..."
            onSelect={setStation}
            shortcutTarget
          />
        </div>

        <button
          onClick={() => {
            if (!station) return;

            goToStation(station.stationCode, station.stationName);
          }}
          disabled={!station}
          className="bg-primary flex h-10 items-center justify-center rounded-lg px-6 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Search
        </button>
      </div>

      <PopularSearchChips
        entries={getPopularStationSearches()}
        onSelect={async (value) => {
          // Popular-search chips store a display name, not a station code -
          // re-resolve to a real station via search so the same "pick then
          // navigate" flow above still applies rather than guessing a code.
          const matches = await searchStations(value);

          const match = matches.find(
            (s) => s.stationName.toLowerCase() === value.toLowerCase()
          );

          if (match) {
            setStation(match);
            goToStation(match.stationCode, match.stationName);
          }
        }}
      />
    </Card>
  );
}
