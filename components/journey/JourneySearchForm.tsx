'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { ArrowUpDown, Heart } from 'lucide-react';

import StationAutocomplete, {
  StationAutocompleteRef,
} from '../common/StationAutocomplete';

import { StationSearchResponse } from '@/types/station';
import { addJourneySearch } from '@/stores/recentSearchStore';
import { getStation } from '@/services/stationService';
import { usePreferences } from '@/stores/preferencesStore';
import { isFavorite, toggleFavorite, useFavorites } from '@/stores/favoritesStore';

interface JourneySearchFormProps {
  onSearch: (from: string, to: string) => void;
  initialFrom?: string;
  initialTo?: string;
}
export default function JourneySearchForm({
  onSearch,
  initialFrom,
  initialTo,
}: JourneySearchFormProps) {
  const [from, setFrom] = useState<StationSearchResponse | null>(null);
  const [to, setTo] = useState<StationSearchResponse | null>(null);
  const [error, setError] = useState('');

  const fromRef = useRef<StationAutocompleteRef>(null);
  const toRef = useRef<StationAutocompleteRef>(null);

  const preferences = usePreferences();

  // Subscribing (rather than just calling isFavorite once) so the heart
  // icon updates immediately after a toggle - same pattern as
  // PartialJourneySummary's saved-journey bookmark.
  useFavorites();
  const routeIsFavorite =
    from && to
      ? isFavorite({
          type: 'route',
          fromStationCode: from.stationCode,
          fromStationName: from.stationName,
          toStationCode: to.stationCode,
          toStationName: to.stationName,
        })
      : false;

  function handleToggleFavoriteRoute() {
    if (!from || !to) return;

    toggleFavorite({
      type: 'route',
      fromStationCode: from.stationCode,
      fromStationName: from.stationName,
      toStationCode: to.stationCode,
      toStationName: to.stationName,
    });
  }

  const search = useCallback(
    (fromStation: StationSearchResponse, toStation: StationSearchResponse) => {
      addJourneySearch(
        fromStation.stationCode,
        fromStation.stationName,
        toStation.stationCode,
        toStation.stationName
      );

      onSearch(fromStation.stationCode, toStation.stationCode);
    },
    [onSearch]
  );

  useEffect(() => {
    async function initialize() {
      if (!initialFrom || !initialTo) return;

      const [fromStation, toStation] = await Promise.all([
        getStation(initialFrom),
        getStation(initialTo),
      ]);

      setFrom(fromStation);
      setTo(toStation);

      fromRef.current?.setStation(fromStation);
      toRef.current?.setStation(toStation);

      search(fromStation, toStation);
    }

    initialize();
  }, [initialFrom, initialTo, search]);

  // Pre-fill "From" with the user's saved default station (see
  // stores/preferencesStore.ts / the Account page's Preferences card) -
  // only when there's no explicit deep link (initialFrom/initialTo, e.g.
  // from a "search again" link elsewhere in the app), and only once on
  // mount so it doesn't fight the user if they clear the field afterward.
  useEffect(() => {
    if (initialFrom || initialTo) return;
    if (!preferences.defaultFromStationCode || !preferences.defaultFromStationName) return;

    const defaultStation: StationSearchResponse = {
      stationCode: preferences.defaultFromStationCode,
      stationName: preferences.defaultFromStationName,
    };

    setFrom(defaultStation);
    fromRef.current?.setStation(defaultStation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwap = useCallback(() => {
    setError('');

    if (!from && !to) {
      return;
    }

    const nextFrom = to;
    const nextTo = from;

    setFrom(nextFrom);
    setTo(nextTo);

    fromRef.current?.setStation(nextFrom);
    toRef.current?.setStation(nextTo);
  }, [from, to]);

  const handleSearch = useCallback(() => {
    if (!from || !to) {
      return;
    }

    if (from.stationCode === to.stationCode) {
      setError('Source and destination stations must be different.');
      return;
    }

    setError('');

    addJourneySearch(
      from.stationCode,
      from.stationName,
      to.stationCode,
      to.stationName
    );

    search(from, to);
  }, [from, to, search]);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <StationAutocomplete
            ref={fromRef}
            label="From"
            placeholder="Search source station..."
            onSelect={(station) => {
              setFrom(station);
              setError('');
            }}
            shortcutTarget
          />
        </div>

        <div className="flex justify-center lg:pb-1">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!from && !to}
            aria-label="Swap stations"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpDown className="h-4 w-4 rotate-90 lg:rotate-0" />
          </button>
        </div>

        <div className="flex-1">
          <StationAutocomplete
            ref={toRef}
            label="To"
            placeholder="Search destination station..."
            onSelect={(station) => {
              setTo(station);
              setError('');
            }}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex w-full items-center gap-2 md:w-auto">
        <button
          type="button"
          onClick={handleToggleFavoriteRoute}
          disabled={!from || !to}
          aria-pressed={routeIsFavorite}
          aria-label={routeIsFavorite ? 'Remove this route from favorites' : 'Favorite this route'}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition ${
            !from || !to
              ? 'cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
              : routeIsFavorite
                ? 'border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-500/15 text-orange-600'
                : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-orange-300 hover:text-orange-600'
          }`}
        >
          <Heart className="h-4 w-4" aria-hidden="true" fill={routeIsFavorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          disabled={!from || !to}
          onClick={handleSearch}
          className={`inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-medium transition ${
            !from || !to
              ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-600 text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Search Trains
        </button>
      </div>
    </div>
  );
}
