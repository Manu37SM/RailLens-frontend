'use client';
import { useMemo, useState } from 'react';
import { StationTrainResponse } from '@/types/station';
import StationTrainRow from './StationTrainRow';
interface Props {
  trains: StationTrainResponse[];
}
type Filter =
  'all' | 'passing' | 'originating' | 'terminating' | 'departures' | 'arrivals';
const FILTERS: {
  key: Filter;
  label: string;
}[] = [
  { key: 'all', label: 'All' },
  { key: 'originating', label: 'Originating' },
  { key: 'terminating', label: 'Terminating' },
  { key: 'passing', label: 'Passing Through' },
  { key: 'departures', label: 'Departures' },
  { key: 'arrivals', label: 'Arrivals' },
];
function compareTimes(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b);
}
export default function StationTrainList({ trains }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const counts = useMemo(
    () => ({
      all: trains.length,
      originating: trains.filter((t) => t.origin).length,
      terminating: trains.filter((t) => t.destination).length,
      passing: trains.filter((t) => !t.origin && !t.destination).length,
      departures: trains.filter((t) => t.departureTime !== null).length,
      arrivals: trains.filter((t) => t.arrivalTime !== null).length,
    }),
    [trains]
  );
  const filteredTrains = useMemo(() => {
    switch (filter) {
      case 'originating':
        return trains.filter((t) => t.origin);
      case 'terminating':
        return trains.filter((t) => t.destination);
      case 'passing':
        return trains.filter((t) => !t.origin && !t.destination);
      case 'departures':
        return [...trains].sort((a, b) =>
          compareTimes(a.departureTime, b.departureTime)
        );
      case 'arrivals':
        return [...trains].sort((a, b) =>
          compareTimes(a.arrivalTime, b.arrivalTime)
        );
      default:
        return trains;
    }
  }, [trains, filter]);
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Trains Passing Through
        </h2>
      </div>

      {trains.length > 0 && (
        <div
          role="tablist"
          aria-label="Filter trains"
          className="flex flex-wrap gap-1.5 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
      )}

      {filteredTrains.length === 0 ? (
        <div className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
          No trains found.
        </div>
      ) : (
        filteredTrains.map((train) => (
          <StationTrainRow key={train.trainNumber} train={train} />
        ))
      )}
    </div>
  );
}
