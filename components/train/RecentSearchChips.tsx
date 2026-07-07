'use client';

import Link from 'next/link';
import { Clock3, MapPin, Route, TrainFront } from 'lucide-react';

import { useRecentSearches } from '@/stores/recentSearchStore';

interface Props {
  onSelect?: (query: string) => void;
}

export default function RecentSearchChips({ onSelect }: Props) {
  const searches = useRecentSearches();

  const recentSearches = onSelect
    ? searches.filter((s) => s.type === 'train')
    : searches;

  if (searches.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-orange-600" />

        <h2 className="text-sm font-semibold text-slate-700">
          Recent Searches
        </h2>
      </div>

      <div className="flex scrollbar-none gap-2 overflow-x-auto pb-2">
        {recentSearches
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6)
          .map((search) => {
            switch (search.type) {
              case 'train': {
                const content = (
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-orange-300 hover:bg-orange-50">
                    <TrainFront className="h-4 w-4 text-orange-600" />

                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {search.trainNumber}
                      </div>

                      <div className="text-xs text-slate-500">
                        {search.trainName}
                      </div>
                    </div>
                  </div>
                );

                if (onSelect) {
                  return (
                    <button
                      key={search.trainNumber}
                      onClick={() => onSelect(search.trainNumber)}
                      className="flex-shrink-0"
                      aria-label={`Search train ${search.trainNumber}`}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={search.trainNumber}
                    href={`/trains/${search.trainNumber}`}
                    className="flex-shrink-0"
                  >
                    {content}
                  </Link>
                );
              }

              case 'station':
                return (
                  <Link
                    key={search.stationCode}
                    href={`/stations/${search.stationCode}`}
                    className="flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-orange-300 hover:bg-orange-50">
                      <MapPin className="h-4 w-4 text-orange-600" />

                      <div className="text-left">
                        <div className="text-sm font-medium">
                          {search.stationCode}
                        </div>

                        <div className="text-xs text-slate-500">
                          {search.stationName}
                        </div>
                      </div>
                    </div>
                  </Link>
                );

              case 'journey':
                return (
                  <Link
                    key={`${search.fromCode}-${search.toCode}`}
                    href={`/journeys?from=${search.fromCode}&to=${search.toCode}`}
                    className="flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-orange-300 hover:bg-orange-50">
                      <Route className="h-4 w-4 text-orange-600" />

                      <div className="text-left">
                        <div className="text-sm font-medium">
                          {search.fromCode} → {search.toCode}
                        </div>

                        <div className="text-xs text-slate-500">
                          {search.fromName} → {search.toName}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
            }
          })}
      </div>
    </section>
  );
}
