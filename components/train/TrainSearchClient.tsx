'use client';
import { useState } from 'react';
import { SearchX, TrainFront } from 'lucide-react';
import Card from '@/components/layout/Card';
import Container from '@/components/layout/Container';
import SearchBar from '@/components/train/SearchBar';
import TrainList from '@/components/train/TrainList';
import ErrorState from '@/components/common/ErrorState';
import PopularSearchChips from '@/components/common/PopularSearchChips';
import RecentSearchChips from './RecentSearchChips';
import { searchTrains } from '@/services/trainService';
import { ApiError } from '@/services/api';
import { TrainSearchResponse } from '@/types/train';
import {
  getPopularTrainSearches,
  recordTrainSearch,
  usePopularSearches,
} from '@/stores/popularSearchStore';
export default function Home() {
  const [query, setQuery] = useState('');
  const [trains, setTrains] = useState<TrainSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  usePopularSearches();
  async function handleSearch(searchQuery: string = query) {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setError(null);
    setHasSearched(true);
    recordTrainSearch(trimmed);
    try {
      setLoading(true);
      const results = await searchTrains(trimmed);
      setTrains(results);
    } catch (err) {
      setTrains([]);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while searching for trains. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="bg-background min-h-screen">
      <Container>
        <section className="flex flex-col items-center py-8 py-20 text-center">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />
          <RecentSearchChips
            onSelect={(value) => {
              setQuery(value);
              handleSearch(value);
            }}
          />

          <PopularSearchChips
            entries={getPopularTrainSearches()}
            onSelect={(value) => {
              setQuery(value);
              handleSearch(value);
            }}
          />
        </section>

        {error && (
          <section className="pb-20">
            <ErrorState message={error} onRetry={() => handleSearch()} />
          </section>
        )}

        {!error && loading && (
          <section className="pb-20">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {!error && !loading && trains.length > 0 && (
          <section className="pb-20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Search Results
                </h2>

                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {trains.length} train{trains.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <TrainList trains={trains} />
          </section>
        )}

        {!error && !loading && hasSearched && trains.length === 0 && (
          <section className="pb-20">
            <Card className="py-10">
              <div className="flex flex-col items-center text-center">
                <SearchX className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  No trains found
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  We couldn&apos;t find any trains matching &quot;{query}
                  &quot;.
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Try a different train number or name.
                </p>
              </div>
            </Card>
          </section>
        )}

        {!error && !loading && !hasSearched && (
          <section className="pb-20">
            <Card className="py-10">
              <div className="flex flex-col items-center text-center">
                <TrainFront className="mb-3 h-12 w-12 text-orange-500" />

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Search for a train
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Enter a train number or name above to see its schedule, route
                  and running days.
                </p>
              </div>
            </Card>
          </section>
        )}
      </Container>
    </main>
  );
}
