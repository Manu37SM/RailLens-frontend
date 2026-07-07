import { SearchX, TrainFront, ArrowUpDown } from 'lucide-react';

import Card from '@/components/layout/Card';
import { JourneySearchResponse } from '@/types/journey';

import JourneyResultRow from './JourneyResultRow';

interface Props {
  results: JourneySearchResponse | null;
  loading: boolean;
}

export default function JourneyResults({ results, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <TrainFront className="h-4 w-4 text-orange-600" />
          <span>Searching journeys...</span>
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="space-y-3">
              <div className="h-5 w-48 rounded bg-slate-200" />

              <div className="flex items-center justify-between">
                <div className="h-8 w-32 rounded bg-slate-200" />
                <div className="h-8 w-32 rounded bg-slate-200" />
              </div>

              <div className="flex gap-3">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
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

          <h3 className="text-lg font-semibold text-slate-900">
            Plan your journey
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500">
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
          <SearchX className="mb-3 h-12 w-12 text-slate-400" />

          <h3 className="text-lg font-semibold">No trains found</h3>

          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t find any direct trains between these stations.
          </p>

          <p className="text-sm text-slate-500">
            Try another station combination.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Results Header */}

      <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <TrainFront className="h-5 w-5 text-orange-600" />

          <div>
            <h2 className="font-semibold text-slate-900">Journey Results</h2>

            <p className="text-xs text-slate-500">
              {results.totalTrains} train
              {results.totalTrains !== 1 && 's'} found
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-400"
          title="Sorting coming soon"
        >
          <ArrowUpDown className="h-4 w-4 rotate-90 lg:rotate-0" />
          Sort
        </button>
      </div>

      {/* Journey Cards */}

      <div className="space-y-3">
        {results.trains.map((train) => (
          <JourneyResultRow key={train.trainNumber} train={train} />
        ))}
      </div>
    </div>
  );
}
