'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Clock3, MapPin, Route, Trash2, TrainFront, X } from 'lucide-react';

import Card from '@/components/layout/Card';
import {
  clearRecentSearches,
  removeSearch,
  useRecentSearches,
} from '@/stores/recentSearchStore';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { RecentSearch } from '@/types/recentSearch';

function searchHref(search: RecentSearch): string {
  switch (search.type) {
    case 'train':
      return `/trains/${search.trainNumber}`;
    case 'station':
      return `/stations/${search.stationCode}`;
    case 'journey':
      return `/journeys?from=${search.fromCode}&to=${search.toCode}`;
  }
}

function searchKey(search: RecentSearch): string {
  switch (search.type) {
    case 'train':
      return `train-${search.trainNumber}`;
    case 'station':
      return `station-${search.stationCode}`;
    case 'journey':
      return `journey-${search.fromCode}-${search.toCode}`;
  }
}

function SearchIcon({ type }: { type: RecentSearch['type'] }) {
  const className = 'h-5 w-5 text-orange-600';

  switch (type) {
    case 'train':
      return <TrainFront className={className} />;
    case 'station':
      return <MapPin className={className} />;
    case 'journey':
      return <Route className={className} />;
  }
}

function searchTitle(search: RecentSearch): string {
  switch (search.type) {
    case 'train':
      return `${search.trainNumber} · ${search.trainName}`;
    case 'station':
      return `${search.stationCode} · ${search.stationName}`;
    case 'journey':
      return `${search.fromCode} → ${search.toCode}`;
  }
}

function searchSubtitle(search: RecentSearch): string {
  switch (search.type) {
    case 'train':
      return 'Train';
    case 'station':
      return 'Station';
    case 'journey':
      return `${search.fromName} → ${search.toName}`;
  }
}

export default function SearchHistoryList() {
  const searches = useRecentSearches();
  // Confirm before wiping everything - this can't be undone once
  // localStorage is cleared, and "Clear all" sitting right next to a list
  // of items people may still want is an easy misclick.
  const [confirmingClear, setConfirmingClear] = useState(false);

  const sorted = [...searches].sort((a, b) => b.timestamp - a.timestamp);

  if (sorted.length === 0) {
    return (
      <Card className="py-10">
        <div className="flex flex-col items-center text-center">
          <Clock3 className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No search history yet
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Trains, stations and journeys you search for will show up here,
            so you can quickly get back to them later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        {confirmingClear ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Clear all {sorted.length} item{sorted.length !== 1 ? 's' : ''}?
            </span>
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                setConfirmingClear(false);
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((search) => (
          <Card
            key={searchKey(search)}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-100">
              <SearchIcon type={search.type} />
            </div>

            <Link href={searchHref(search)} className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {searchTitle(search)}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {searchSubtitle(search)} · {formatRelativeTime(search.timestamp)}
              </p>
            </Link>

            <button
              type="button"
              onClick={() => removeSearch(search)}
              aria-label={`Remove ${searchTitle(search)} from history`}
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
