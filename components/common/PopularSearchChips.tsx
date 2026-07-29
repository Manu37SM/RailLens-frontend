'use client';

import { Flame } from 'lucide-react';

import { PopularSearchEntry } from '@/types/popularSearch';

interface Props {
  entries: PopularSearchEntry[];
  onSelect: (query: string) => void;
}

/**
 * "Popular searches" here means "queries you've typed on this device" -
 * see stores/popularSearchStore.ts's doc comment. Same visual language as
 * RecentSearchChips (pill row) but a distinct, smaller signal, so it's a
 * separate component rather than a third case bolted onto that one.
 */
export default function PopularSearchChips({ entries, onSelect }: Props) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-600" />

        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Popular Searches
        </h2>
      </div>

      <div className="flex scrollbar-none gap-2 overflow-x-auto pb-2">
        {entries.map((entry) => (
          <button
            key={entry.query}
            onClick={() => onSelect(entry.displayQuery)}
            className="flex-shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10"
          >
            {entry.displayQuery}
          </button>
        ))}
      </div>
    </section>
  );
}
