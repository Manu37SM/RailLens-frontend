'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Heart } from 'lucide-react';

import StationAutocomplete, {
  StationAutocompleteRef,
} from '../common/StationAutocomplete';

import { StationSearchResponse } from '@/types/station';
import { addJourneySearch } from '@/stores/recentSearchStore';
import { getStation } from '@/services/stationService';
import { getPreferences, usePreferences } from '@/stores/preferencesStore';
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

  // Tracks the from/to pair this component itself last pushed via
  // router.replace() in search() below - see search()'s comment for why
  // this exists.
  const lastSyncedRef = useRef<{ from?: string; to?: string }>({});

  const router = useRouter();
  // Called for its hydration side-effect only (see the effect below that
  // reads getPreferences() instead) - same call-without-using-the-return-
  // value pattern as useFavorites() just below.
  usePreferences();

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

      // Keep the URL in sync with every search, not just the first one on
      // page load - previously /journeys?from=X&to=Y only reflected the
      // initial deep link; searching again after changing stations never
      // updated it, so the "shareable URL" promise only held for the very
      // first search of a page visit. replace() (not push()) so repeated
      // searches don't spam browser history. See the frontend architecture
      // review's "journeys page doesn't sync search state back to the URL"
      // finding.
      //
      // Record this as our own echo before firing it - the effect below
      // reads initialFrom/initialTo (the props this replace() eventually
      // feeds back in via the server-rendered page) and needs to tell "a
      // real external navigation just happened" apart from "the URL I just
      // wrote came back around as props." See that effect's comment.
      lastSyncedRef.current = { from: fromStation.stationCode, to: toStation.stationCode };

      router.replace(
        `/journeys?from=${encodeURIComponent(fromStation.stationCode)}&to=${encodeURIComponent(toStation.stationCode)}`,
        { scroll: false }
      );

      onSearch(fromStation.stationCode, toStation.stationCode);
    },
    [onSearch, router]
  );

  useEffect(() => {
    async function initialize() {
      if (!initialFrom || !initialTo) return;

      // search() below calls router.replace() to keep the URL in sync,
      // which changes this page's searchParams and therefore re-renders
      // this component with new initialFrom/initialTo props - the exact
      // same props this effect depends on. Without this check, every
      // manual search or swap-then-search re-triggered this effect a
      // second time (initialFrom/initialTo now matching what was just
      // searched), which re-fetched both stations and called search()
      // again - a redundant duplicate request every single time, right
      // after the user's own action, that could resolve after (and
      // silently clobber) whatever the results panel was already showing.
      // Arriving from an actual external link (a favorite/recent search,
      // or a fresh deep link) never matches lastSyncedRef, since that's
      // only ever set by this component's own search() calls - so real
      // navigations still work exactly as before.
      if (lastSyncedRef.current.from === initialFrom && lastSyncedRef.current.to === initialTo) {
        return;
      }

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
  //
  // Reads via getPreferences() rather than the `preferences` variable
  // above - createLocalStorageStore hydrates from localStorage inside its
  // own subscribe effect, which mutates the store's cache synchronously
  // but only notifies React of the change a tick later (queueMicrotask).
  // Since this effect has `[]` deps, it only ever runs once, closing over
  // whatever `preferences` was during the very first render - which is
  // always the pre-hydration default (localStorage hasn't been read yet
  // at that point), so the closed-over value would silently never reflect
  // a saved default station. getPreferences() reads the store's live
  // value at the moment this effect actually runs instead, which by then
  // already reflects hydration - usePreferences() (and therefore its
  // internal subscribe effect) is called earlier in this component than
  // this effect, so React runs that hydration effect first.
  useEffect(() => {
    if (initialFrom || initialTo) return;

    const saved = getPreferences();

    if (!saved.defaultFromStationCode || !saved.defaultFromStationName) return;

    const defaultStation: StationSearchResponse = {
      stationCode: saved.defaultFromStationCode,
      stationName: saved.defaultFromStationName,
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
