'use client';

import { useMemo, useState } from 'react';
import { SearchX, TrainFront, ArrowUpDown } from 'lucide-react';

import Card from '@/components/layout/Card';
import ErrorState from '@/components/common/ErrorState';
import { JourneySearchResponse, JourneyTrainResponse } from '@/types/journey';

import JourneyResultRow from './JourneyResultRow';

type SortMode = 'fastest' | 'slowest';

// The backend already returns results sorted by duration ascending
// (JourneyService - "fastest first"), so 'fastest' here is just "keep
// the order the API gave us" rather than a client-side re-sort.
//
// The toggle used to flip to a 'distance' mode, sorting by
// JourneyTrainResponse.distance - but distance is the fixed track
// distance between the two searched stations, so every train in a given
// result set shares the same (or near-identical) value. Sorting an
// all-equal key is a stable no-op, so the button visibly did nothing -
// reported 2026-08-05 as "fastest first button is not working". Total
// travel time (movingMinutes + haltedMinutes) does vary per train, so
// reversing by that actually reorders the list.
function totalMinutes(train: JourneyTrainResponse): number {
  return train.movingMinutes + train.haltedMinutes;
}

interface Props {
  results: JourneySearchResponse | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function JourneyResults({
  results,
  loading,
  error,
  onRetry,
}: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('fastest');

  const sortedTrains = useMemo(() => {
    if (!results) return [];

    const sorted = [...results.trains].sort((a, b) => totalMinutes(a) - totalMinutes(b));
    return sortMode === 'fastest' ? sorted : sorted.reverse();
  }, [results, sortMode]);

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <TrainFront className="h-4 w-4 text-orange-600" />
          <span>Searching journeys...</span>
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="space-y-3">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center justify-between">
                <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="flex gap-3">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!results) {
    return (
      <Card className="py-10">
        <div className="flex flex-col items-center text-center">
          <TrainFront className="mb-3 h-12 w-12 text-orange-500" />

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Plan your journey
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Search for direct trains between any two stations. Your search
            results will appear here.
          </p>
        </div>
      </Card>
    );
  }

  if (results.totalTrains === 0) {
    return (
      <Card className="py-10">
        <div className="flex flex-col items-center text-center">
          <SearchX className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />

          <h3 className="text-lg font-semibold">No trains found</h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We couldn&apos;t find any direct trains between these stations.
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try another station combination.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Results Header */}

      <div className="flex items-center justify-between rounded-lg border bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <TrainFront className="h-5 w-5 text-orange-600" />

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Journey Results</h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {results.totalTrains} train
              {results.totalTrains !== 1 && 's'} found
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSortMode((prev) => (prev === 'fastest' ? 'slowest' : 'fastest'))}
          aria-pressed={sortMode === 'slowest'}
          className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          title={
            sortMode === 'fastest'
              ? 'Sorted fastest first - tap to sort slowest first instead'
              : 'Sorted slowest first - tap to sort fastest first instead'
          }
        >
          <ArrowUpDown className="h-4 w-4 rotate-90 lg:rotate-0" />
          {sortMode === 'fastest' ? 'Fastest first' : 'Slowest first'}
        </button>
      </div>

      {/* Journey Cards */}

      <div className="space-y-3">
        {sortedTrains.map((train) => (
          <JourneyResultRow key={train.trainNumber} train={train} />
        ))}
      </div>
    </div>
  );
}
