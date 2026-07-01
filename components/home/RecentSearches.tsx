'use client';

import { useState } from 'react';
import { History } from 'lucide-react';

import RecentSearchCard from './RecentSearchCard';

import {
  clearRecentSearches,
  getRecentSearches,
} from '@/services/recentSearchService';
import { RecentSearch } from '@/types/recentSearch';

export default function RecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>(() =>
    getRecentSearches().slice(0, 3)
  );

  if (searches.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="text-primary" size={20} />
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Searches
          </h2>
        </div>

        {searches.length > 0 && (
          <button
            onClick={() => {
              clearRecentSearches();
              setSearches([]);
            }}
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {searches.map((search) => (
          <RecentSearchCard
            key={`${search.type}-${search.timestamp}`}
            search={search}
          />
        ))}
      </div>
    </section>
  );
}
