'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, TrainFront } from 'lucide-react';
import Card from '@/components/layout/Card';
import { smartSearch } from '@/services/smartSearchService';
import { ApiError } from '@/services/api';
import { SmartSearchResponse } from '@/types/smartSearch';
const EXAMPLES = [
  'trains that stop at both NDLS and HWH',
  'trains from NDLS to HWH',
  'trains longer than 1000km',
  'trains with more than 20 halts',
];
export default function SmartSearchClient() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SmartSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await smartSearch(q));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-4">
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. trains that stop at both NDLS and HWH"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={16} aria-hidden="true" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                runSearch(example);
              }}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {example}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {result && !result.recognized && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sorry, I couldn&apos;t understand that query. Try one of the
            examples above, or a similar phrasing.
          </p>
        </Card>
      )}

      {result && result.recognized && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-orange-600" aria-hidden="true" />
            {result.interpretedAs ?? 'Results'} &middot;{' '}
            {result.matchCount.toLocaleString()} match
            {result.matchCount === 1 ? '' : 'es'}
          </div>

          {result.trains.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No trains matched.
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {result.trains.slice(0, 50).map((train) => (
                  <li key={train.trainNumber}>
                    <Link
                      href={`/trains/${train.trainNumber}`}
                      className="flex items-center gap-2 text-sm text-slate-900 hover:text-orange-600 dark:text-slate-100"
                    >
                      <TrainFront
                        size={14}
                        className="text-orange-600"
                        aria-hidden="true"
                      />
                      {train.trainNumber} &middot; {train.trainName}
                    </Link>
                  </li>
                ))}
              </ul>
              {result.trains.length > 50 && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Showing 50 of {result.trains.length.toLocaleString()} matches.
                  Try a more specific query to narrow this down.
                </p>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
